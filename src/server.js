// Node.js core dependencies
const path = require('path');
const express = require('express');
const session = require('express-session');
const favicon = require('serve-favicon');

// Npm dependencies
const i18n = require('i18n');
const argv = require('minimist')(process.argv.slice(2));
const compression = require('compression');
const nunjucks = require('nunjucks');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const { v4: uuid } = require('uuid');
const csrf = require('csurf');
const PgSession = require('connect-pg-simple')(session);
const { correlationIdMiddleware, getCorrelationId } = require('./common/utils/correlationContext');

// Local dependencies
const logger = require('./common/utils/logger')(__filename);
const config = require('./common/config/index');
const availability = require('./common/config/availability');
const router = require('./app/router');
const requestLoggingMiddleware = require('./common/utils/requestLogging');
const autocompleteUtil = require('./common/utils/autocomplete');
const nunjucksFilters = require('./common/utils/templateFilters.js');
const travelPermissionCodes = require('./common/utils/travel_permission_codes.json');
const { IS_HTTPS_SERVER, SAME_SITE_VALUE } = require('./common/config');
const airports = require('./common/utils/airports');

// Global constants
const PORT = process.env.PORT || 3000;
const { NODE_ENV } = process.env;
const G4_ID = process.env.G4_ID || '';
const BASE_URL = process.env.BASE_URL || '';

// Set Cookie secure flag depending on environment variable
let secureFlag = process.env.COOKIE_SECURE_FLAG === 'true';

logger.debug('Secure flag for cookie set', { secureFlag });

const STATIC_ASSET_PREFIXES = [
  '/assets/',
  '/images/',
  '/public/',
  '/stylesheets/',
  '/javascripts/',
  '/.well-known/', // Chrome/devtools probe and similar browser discovery requests
];

const STATIC_OR_PROBE_EXTENSION = /\.(map|css|js|png|svg|ico|woff2?|json)$/i;

function getRequestPath(req) {
  return req.path || req.originalUrl || req.url || '';
}

function isStaticOrProbeRequest(req) {
  const requestPath = getRequestPath(req);
  return (
    STATIC_ASSET_PREFIXES.some((prefix) => requestPath.startsWith(prefix)) ||
    STATIC_OR_PROBE_EXTENSION.test(requestPath)
  );
}

// Define app views
const APP_VIEWS = [
  path.join(__dirname, '/govuk_modules/govuk_template/views/layouts'),
  __dirname,
  'node_modules/govuk-frontend/',
  'node_modules/govuk-frontend/dist/govuk/components/',
  'node_modules/@govuk-one-login/service-header/',
  'common/templates',
  'common/templates/includes',
];

function initialisExpressSession(app) {
  app.use(cookieParser());
  app.use(
    session({
      name: 'sess_id',
      genid: () => uuid(),
      store: new PgSession({
        conString: config.PUBLIC_SITE_DB_CONNSTR,
        ttl: 60 * 60,
      }),
      secret: config.SESSION_ENCODE_SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: secureFlag,
        httpOnly: IS_HTTPS_SERVER,
        sameSite: SAME_SITE_VALUE,
        maxAge: 60 * 60 * 1000,
      },
    })
  );
}

function initialiseGlobalMiddleware(app) {
  app.use(correlationIdMiddleware);

  if (availability.ENABLE_UNAVAILABLE_PAGE.toLowerCase() === 'true') {
    const validRoutes = ['unavailable', 'public', 'javascripts', 'stylesheets'];
    app.use((req, res, next) => {
      if (!validRoutes.some((el) => req.url.includes(el))) {
        res.redirect('/unavailable');
        return;
      }
      next();
    });
  }

  app.use(
    favicon(path.join(__dirname, 'node_modules', 'govuk-frontend', 'dist', 'govuk', 'assets', 'images', 'favicon.ico'))
  );
  app.use(compression());
  app.use((req, res, next) => {
    if (isStaticOrProbeRequest(req)) {
      next();
      return;
    }

    const startTimeMs = Date.now();
    res.on('finish', () => {
      logger.info('HTTP request complete', {
        method: req.method,
        url: getRequestPath(req),
        statusCode: res.statusCode,
        durationMs: Date.now() - startTimeMs,
        sessionId: req.sessionID || null,
        correlationId: req.correlationId || getCorrelationId() || null,
      });
    });
    next();
  });

  if (process.env.DISABLE_REQUEST_LOGGING !== 'true') {
    app.use(requestLoggingMiddleware);
  }
  app.use(express.json());
  app.use(
    express.urlencoded({
      extended: false,
      parameterLimit: 300,
      limit: '50kb',
    })
  );

  app.use(
    csrf({
      cookie: {
        httpOnly: true,
        secure: secureFlag,
      },
    })
  );

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", 'https://www.googletagmanager.com', 'https://www.google-analytics.com'],
          connectSrc: ["'self'", 'https://www.google-analytics.com', 'https://region1.google-analytics.com'],
          imgSrc: ["'self'", 'data:', 'https://www.google-analytics.com', 'https://www.googletagmanager.com'],
          styleSrc: ["'self'"],
          objectSrc: ["'none'"],
        },
      },
    })
  );
}

function initialiseI18n(app) {
  i18n.configure({
    locales: ['en'],
    directory: path.join(__dirname, '/locales'),
    objectNotation: true,
    defaultLocale: 'en',
    register: global,
  });
  app.use(i18n.init);
}

function initialiseProxy(app) {
  app.enable('trust proxy');
}

function initialiseTemplateEngine(app) {
  // Configure nunjucks
  // see https://mozilla.github.io/nunjucks/api.html#configure
  const nunjucksConfiguration = {
    express: app, // The express app that nunjucks should install to
    autoescape: true, // Controls if output with dangerous characters are escaped automatically
    throwOnUndefined: false, // Throw errors when outputting a null/undefined value
    trimBlocks: true, // Automatically remove trailing newlines from a block/tag
    lstripBlocks: true, // Automatically remove leading whitespace from a block/tag
    watch: false, // Reload templates when they are changed (server-side). To use watch, make sure optional dependency chokidar is installed
    noCache: NODE_ENV !== 'production', // Never use a cache and recompile templates each time (server-side)
  };

  // Initialise nunjucks environment
  const nunjucksEnvironment = nunjucks.configure(APP_VIEWS, nunjucksConfiguration);

  // nunjucksEnvironment.addFilter('date, nunjucksDate');

  // Set view engine
  app.set('view engine', 'njk');

  nunjucksEnvironment.addGlobal('govukRebrand', true);
  nunjucksEnvironment.addGlobal('g4_id', G4_ID);
  nunjucksEnvironment.addGlobal('base_url', BASE_URL);
  nunjucksEnvironment.addGlobal('travelPermissionCodes', travelPermissionCodes);
  nunjucksEnvironment.addFilter('uncamelCase', nunjucksFilters.uncamelCase);
  nunjucksEnvironment.addFilter('containsError', nunjucksFilters.containsError);
  nunjucksEnvironment.addFilter('expiryDate', nunjucksFilters.expiryDate);

  // Country list added to the nunjucks global environment, up for debate whether this is the best place
  nunjucksEnvironment.addGlobal('nationalityList', autocompleteUtil.nationalityList);
  nunjucksEnvironment.addGlobal('countryList', autocompleteUtil.countryList);
  nunjucksEnvironment.addGlobal('airportList', autocompleteUtil.airportList);
  nunjucksEnvironment.addGlobal('codeToAirfield', airports.findByCode);

  // Just an example year two years into the future
  nunjucksEnvironment.addGlobal('futureYear', new Date().getFullYear() + 2);
  // nunjucksEnvironment.addGlobal("toDate", toDate());
  nunjucksEnvironment.addGlobal('expiryDate', new Date().toISOString().replace(/T.*/, '').split('-').join('-'));
  nunjucksEnvironment.addGlobal('MAX_STRING_LENGTH', config.MAX_STRING_LENGTH);
  nunjucksEnvironment.addGlobal('MAX_POSTCODE_LENGTH', config.MAX_POSTCODE_LENGTH);
  nunjucksEnvironment.addGlobal('MAX_REGISTRATION_LENGTH', config.MAX_REGISTRATION_LENGTH);
  nunjucksEnvironment.addGlobal('MAX_EMAIL_LENGTH', config.MAX_EMAIL_LENGTH);
  nunjucksEnvironment.addGlobal('MAX_ADDRESS_LINE_LENGTH', config.MAX_ADDRESS_LINE_LENGTH);
  nunjucksEnvironment.addGlobal('MAX_TEXT_BOX_LENGTH', config.MAX_TEXT_BOX_LENGTH);
  // Add unavailable page variables into nunjucks envrionment
  nunjucksEnvironment.addGlobal('IS_PLANNED_MAINTENANCE', availability.IS_PLANNED_MAINTENANCE);
  nunjucksEnvironment.addGlobal('MAINTENANCE_START_DATETIME', availability.MAINTENANCE_START_DATETIME);
  nunjucksEnvironment.addGlobal('MAINTENANCE_END_DATETIME', availability.MAINTENANCE_END_DATETIME);

  nunjucksEnvironment.addGlobal('CARRIER_SUPPORT_HUB_UK_NUMBER', config.CARRIER_SUPPORT_HUB_UK_NUMBER);
  nunjucksEnvironment.addGlobal(
    'CARRIER_SUPPORT_HUB_INTERNATIONAL_NUMBER',
    config.CARRIER_SUPPORT_HUB_INTERNATIONAL_NUMBER
  );

  nunjucksEnvironment.addGlobal('expiryDate', new Date().toISOString().replace(/T.*/, '').split('-').join('-'));
}

function initialisePublic(app) {
  app.use('/javascripts', express.static(path.join(__dirname, '/node_modules/accessible-autocomplete/dist')));
  //app.use('/assets', express.static(path.join(__dirname, '/node_modules/govuk-frontend/assets')));
  app.use('/assets', express.static(path.join(__dirname, '/common/assets/')));
  app.use('/stylesheets', express.static(path.join(__dirname, '/public/stylesheets/')));
  app.use('/javascripts', express.static(path.join(__dirname, '/public/javascripts/')));
}

function initialiseRoutes(app) {
  router.bind(app);
}

function initialiseErrorHandling(app) {
  app.use((req, res) => {
    if (isStaticOrProbeRequest(req)) {
      return res.sendStatus(404);
    }

    if (req.accepts('html')) {
      logger.info('404 fallback for request', {
        method: req.method,
        url: getRequestPath(req),
      });
      return res.status(404).render('app/error/404');
    }

    return res.sendStatus(404);
  });
}

/**
 * Configures app
 * @return app
 */
function initialise() {
  const unconfiguredApp = express();
  unconfiguredApp.disable('x-powered-by');
  unconfiguredApp.use(helmet.noCache());
  unconfiguredApp.use(helmet.frameguard());

  async function prepDb() {
    try {
      initialisExpressSession(unconfiguredApp);
      initialiseProxy(unconfiguredApp);
      initialiseI18n(unconfiguredApp);
      initialiseGlobalMiddleware(unconfiguredApp);
      initialiseTemplateEngine(unconfiguredApp);
      initialiseRoutes(unconfiguredApp);
      initialisePublic(unconfiguredApp);
      initialiseErrorHandling(unconfiguredApp);
    } catch (e) {
      logger.error('Failed to prepare database');
      logger.debug(e);
    }
  }
  prepDb();

  return unconfiguredApp;
}

function listen() {
  const app = initialise();
  app.listen(PORT);
  logger.info(`Listening on port ${PORT}`);
}

/**
 * Starts app after ensuring DB is up
 */
function start() {
  listen();
}

/**
 * -i flag. Immediately invoke start.
 * Allows script to be run by task runner
 */
if (argv.i) {
  start();
}

module.exports = {
  start,
  getApp: initialise,
};
