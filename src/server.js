// Node.js core dependencies
const path = require('path');

// Npm dependencies
const express = require('express');
const session = require('express-session');
//const cookieSession = require('cookie-session');
const favicon = require('serve-favicon');
const bodyParser = require('body-parser');
const i18n = require('i18n');
const loggingMiddleware = require('morgan');
const argv = require('minimist')(process.argv.slice(2));
const staticify = require('staticify')(path.join(__dirname, 'public'));
const compression = require('compression');
const nunjucks = require('nunjucks');
const Sequelize = require('sequelize');
const helmet = require('helmet');
const _ = require('lodash');
const logger = require('./common/utils/logger');
const cookieParser = require('cookie-parser');
const crypto = require('crypto');
const uuid = require('uuid/v4');
const FileStore = require('session-file-store')(session);
const config = require('./common/config/index');
const csrf = require('csurf');
const nunjucksFilters = require('./common/utils/templateFilters.js');


// Local dependencies
const router = require('./app/router');
const noCache = require('./common/utils/no-cache');
const correlationHeader = require('./common/middleware/correlation-header');

// Global constants
const unconfiguredApp = express();
const oneYear = 86400000 * 365;
const publicCaching = {
  maxAge: oneYear
};
const PORT = (process.env.PORT || 3000);
const {
  NODE_ENV
} = process.env;
const CSS_PATH = staticify.getVersionedPath('/stylesheets/application.min.css');
// const CSS_PATH2 = staticify.getVersionedPath('/stylesheets/govuk-frontend-2.1.0.min.css')
const JAVASCRIPT_PATH = staticify.getVersionedPath('/javascripts/application.js');
const GA_ID = (process.env.GA_ID || '');
const ua = require('universal-analytics');
const visitor = ua(GA_ID);
const COOKIE_SECRET = (process.env.COOKIE_SECRET || '');
const BASE_URL = (process.env.BASE_URL || '');
const app = express;
let secureFlag = false;
if (process.env.COOKIE_SECURE_FLAG == "true") {
  secureFlag = true;
}
// Define app views
const APP_VIEWS = [
  path.join(__dirname, '/govuk_modules/govuk_template/views/layouts'),
  __dirname,
  'node_modules/govuk-frontend/',
  'node_modules/govuk-frontend/components/',
  'common/templates',
  'common/templates/includes',
];

function initialisexpresssession(app) {
  app.use(cookieParser());
  const pgSession = require('connect-pg-simple')(session);
  app.use(session({
    name: 'sess_id',
    genid: function (req) {
      return uuid()
    },
    store: new pgSession({
      conString: config.PUBLIC_SITE_DB_CONNSTR,
    }),
    secret: config.SESSION_ENCODE_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: secureFlag,
      httpOnly: true,
      maxAge: 60 * 60 * 1000
    },
  }));
  logger.info('Set express session');
  logger.info('Set csrf');
}


function initialiseGlobalMiddleware(app) {
  logger.info('Initalising global middleware');

  if (config.ENABLE_UNAVAILABLE_PAGE.toLowerCase() == 'true') {
    logger.info('Enabling service unavailable middleware');
    app.use(function (req, res, next) {
      const validRoutes = ['unavailable', 'public', 'javascripts', 'stylesheets']
      if (!validRoutes.some(el => req.url.includes(el))) {
        return res.redirect('/unavailable');
      }
      next();
    });
  }

  app.set('settings', {
    getVersionedPath: staticify.getVersionedPath
  });
  app.use(favicon(path.join(__dirname, 'node_modules', 'govuk-frontend', 'assets', 'images', 'favicon.ico')));
  app.use(compression());
  app.use(staticify.middleware);

  if (process.env.DISABLE_REQUEST_LOGGING !== 'true') {
    app.use(/\/((?!images|public|stylesheets|javascripts).)*/, loggingMiddleware(
      ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" - total time :response-time ms',
    ));
  }
  //app.use(csrf({cookie: true}));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({
    extended: true
  }));
 app.use(csrf({cookie: {
    httpOnly: true,
    secure: true
  } }));

  app.use((req, res, next) => {
    res.locals.asset_path = '/public/'; // eslint-disable-line camelcase
    noCache(res);
    var token = req.csrfToken();
    res.cookie('XSRF-TOKEN', token);

    res.locals.csrfToken = token;
    next();
  });
  logger.info('Set csrf Token')
  app.use(helmet());

  app.use('*', correlationHeader);
  logger.info('Set global middleware');
}

function initialiseI18n(app) {
  i18n.configure({
    locales: ['en'],
    directory: path.join(__dirname, '/locales'),
    objectNotation: true,
    defaultLocale: 'en',
    register: global,
  });
  logger.info('Initialised i18n');
  app.use(i18n.init);
  logger.info('Set il8n');
}

function initialiseProxy(app) {
  app.enable('trust proxy');
  logger.info('Proxy Enabled');
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
  logger.info('Set template engine');

  // Initialise nunjucks environment
  const nunjucksEnvironment = nunjucks.configure(APP_VIEWS, nunjucksConfiguration);

  // Set view engine
  app.set('view engine', 'njk');
  logger.info('Set view engine');

  // Version static assets on production for better caching
  // if it's not production we want to re-evaluate the assets on each file change
  // nunjucksEnvironment.addGlobal('css_path', NODE_ENV === 'production' ? CSS_PATH : staticify.getVersionedPath('/stylesheets/application.min.css'));
  // // nunjucksEnvironment.addGlobal('css_path', NODE_ENV === 'production' ? CSS_PATH2 : staticify.getVersionedPath('/stylesheets/govuk-frontend-2.1.0.min.css'))
  // nunjucksEnvironment.addGlobal('js_path', NODE_ENV === 'production' ? JAVASCRIPT_PATH : staticify.getVersionedPath('/javascripts/application.js'));
  nunjucksEnvironment.addGlobal('ga_id', GA_ID);
  nunjucksEnvironment.addGlobal('ga_id', GA_ID);
  nunjucksEnvironment.addGlobal('base_url', BASE_URL);
  nunjucksEnvironment.addFilter('uncamelCase', nunjucksFilters.uncamelCase)
  // logger.info('Set global settings for nunjucks');
}


function initialisePublic(app) {
  app.use('/assets', express.static(path.join(__dirname, '/node_modules/govuk-frontend/assets')));
  app.use('/stylesheets', express.static(path.join(__dirname, '/public/stylesheets/')));
  app.use('/javascripts', express.static(path.join(__dirname, '/public/javascripts/')));
  logger.info('Initialised public assets');
}

function initialiseCookie(app) {
  app.use(cookieSession({
    name: '',
    keys: [COOKIE_SECRET],
    //maxAge: 8 * 60 * 60 * 500, // 4
    httpOnly: true,
  }));
  logger.info('Initialised cookieSession');
}

function initialiseRoutes(app) {
  logger.info('Initialised router');
  router.bind(app);
  logger.info('Initialised routes');
}

function initialiseErrorHandling(app) {
  app.use((req, res, next) => {
    res.redirect('/error/404');
  });
  logger.info('Initialised error handling');
}

function listen() {
  const app = initialise();
  app.listen(PORT);
  logger.info('App initialised..');
  logger.info(app);
  logger.info(`Listening on port ${PORT}`);
}

/**
 * Configures app
 * @return app
 */
function initialise() {
  const app = unconfiguredApp;
  app.disable('x-powered-by');
  app.use(helmet.noCache())
  app.use(helmet.frameguard())
  initialisexpresssession(app);
  initialiseProxy(app);
  initialiseI18n(app);
  initialiseGlobalMiddleware(app);
  //initialiseCookie(app);
  initialiseTemplateEngine(app);
  initialiseRoutes(app);
  initialisePublic(app);
  initialiseErrorHandling(app);
  logger.info('Initialised app: ');
  logger.info(app);
  return app;
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
  staticify,
};
