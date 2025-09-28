/* eslint-disable no-underscore-dangle */

// Node.js core dependencies
import path from 'path';

import express from 'express';
import session from 'express-session';
import favicon from 'serve-favicon';

import bodyParser from 'body-parser';

import i18n from 'i18n';
import loggingMiddleware from 'morgan';
import argvFactory from 'minimist';
const argv = argvFactory(process.argv.slice(2));
import compression from 'compression';
import nunjucks from 'nunjucks';
import helmet from 'helmet';
import _ from 'lodash';
import cookieParser from 'cookie-parser';
import uuid from 'uuid';
import csrf from 'csurf';
import PgSessionFactory from 'connect-pg-simple';
const PgSession = PgSessionFactory(session);

import loggerFactory from './common/utils/logger.js';

import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
import { dirname } from 'path';
const __dirname = dirname(__filename);

const logger = loggerFactory(import.meta.url);
import config from './common/config/index.js';
import availability from './common/config/availability.js';
import router from './app/router.js';
import db from './common/utils/db.js';
import noCache from './common/utils/no-cache.js';
import autocompleteUtil from './common/utils/autocomplete.js';
import correlationHeader from './common/middleware/correlation-header.js';
import nunjucksFilters from './common/utils/templateFilters.js';
import travelPermissionCodes from './common/utils/travel_permission_codes.json' with { type: 'json' };
import { IS_HTTPS_SERVER, SAME_SITE_VALUE } from './common/config/index.js';

// Global constants
const PORT = (process.env.PORT || 3000);
const { NODE_ENV } = process.env;
const G4_ID = (process.env.G4_ID || '');
const BASE_URL = (process.env.BASE_URL || '');

// Set Cookie secure flag depending on environment variable
let secureFlag = process.env.COOKIE_SECURE_FLAG === 'true';

logger.debug('Secure Flag for Cookie set to: ' + secureFlag);

// Define app views
const APP_VIEWS = [
  __dirname,
  // path.join(__dirname, '/govuk_modules/govuk_template/views/layouts'),
  path.join(__dirname, '../node_modules/govuk-frontend/'),
  path.join(__dirname, '/node_modules/govuk-frontend/components/'),
  path.join(__dirname, '/common/templates'),
  path.join(__dirname, '/common/templates/includes'),
];

function initialiseDb() {
  return new Promise((resolve, reject) => {
    logger.info('Syncing db');
    db.sequelize.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";')
      .then(() => db.sequelize.sync())
      .then(() => {
        logger.debug('Successfully created tables');
        resolve();
      })
      .catch((e) => {
        logger.error('Failed to sync db');
        logger.error(e);
        reject(e);
      });
  });
}

function initialisExpressSession(app) {
  app.use(cookieParser());
  app.use(session({
    name: 'sess_id',
    genid: () => uuid.v4(),
    store: new PgSession({
      conString: config.PUBLIC_SITE_DB_CONNSTR,
      ttl: 60 * 60,
    }),
    secret: config.SESSION_ENCODE_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: secureFlag,
      httpOnly: IS_HTTPS_SERVER,
      sameSite: SAME_SITE_VALUE,
      maxAge: 60 * 60 * 1000,
    },
  }));
  logger.info('Set express session');
}


function initialiseGlobalMiddleware(app) {
  logger.info('Initalising global middleware');

  if (availability.ENABLE_UNAVAILABLE_PAGE.toLowerCase() === 'true') {
    logger.info('Enabling service unavailable middleware');
    const validRoutes = ['unavailable', 'public', 'javascripts', 'stylesheets'];
    app.use((req, res, next) => {
      if (!validRoutes.some(el => req.url.includes(el))) {
        res.redirect('/unavailable');
        return;
      }
      next();
    });
  }
  //todo: reinstate favicon
  // app.use(favicon(path.join(__dirname, 'node_modules', 'govuk-frontend', 'govuk', 'assets', 'images', 'favicon.ico')));

  app.use(compression());

  if (process.env.DISABLE_REQUEST_LOGGING !== 'true') {
    app.use(/\/((?!images|public|stylesheets|javascripts).)*/, loggingMiddleware(
      ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" - total time :response-time ms',
    ));
  }
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({
    extended: true,
  }));

  app.use(csrf({
    cookie: {
      httpOnly: true,
      secure: secureFlag,
    },
  }));

  app.use((req, res, next) => {
    res.locals.asset_path = '/public/'; // eslint-disable-line camelcase
    noCache(res);
    const token = req.csrfToken();
    res.locals._csrf = token;
    // This might be needed, but leaving it in for now...
    res.cookie('XSRF-TOKEN', token, { httpOnly: true, secure: secureFlag, sameSite: true });

    // Previously, local development required the disabling of CSRF token handling
    // The below adds the csrfToken to the res.render function which should hopefully
    // allow for local development without this hack
    const _render = res.render;
    res.render = function (view, options, fn) {
      _.extend(options, { csrfToken: token });
      _render.call(this, view, options, fn);
    };

    next();
  });

  logger.info('Set CSRF Token');
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
  logger.info('Set i18n');
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

  // nunjucksEnvironment.addFilter('date, nunjucksDate');

  // Set view engine
  app.set('view engine', 'njk');
  logger.info('Set view engine');

  nunjucksEnvironment.addGlobal('g4_id', G4_ID);
  nunjucksEnvironment.addGlobal('base_url', BASE_URL);
  nunjucksEnvironment.addGlobal('travelPermissionCodes', travelPermissionCodes)
  nunjucksEnvironment.addFilter('uncamelCase', nunjucksFilters.uncamelCase);
  nunjucksEnvironment.addFilter('containsError', nunjucksFilters.containsError);
  nunjucksEnvironment.addFilter('expiryDate', nunjucksFilters.expiryDate);
  // Country list added to the nunjucks global environment, up for debate whether this is the best place
  nunjucksEnvironment.addGlobal('nationalityList', autocompleteUtil.nationalityList);
  nunjucksEnvironment.addGlobal('airportList', autocompleteUtil.airportList);
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
  nunjucksEnvironment.addGlobal('CARRIER_SUPPORT_HUB_INTERNATIONAL_NUMBER', config.CARRIER_SUPPORT_HUB_INTERNATIONAL_NUMBER);

  nunjucksEnvironment.addGlobal('ONE_LOGIN_SHOW_ONE_LOGIN', config.ONE_LOGIN_SHOW_ONE_LOGIN);
  nunjucksEnvironment.addGlobal('ONE_LOGIN_POST_MIGRATION', config.ONE_LOGIN_POST_MIGRATION);

  nunjucksEnvironment.addGlobal('expiryDate', new Date().toISOString().replace(/T.*/, '').split('-').join('-'));
  logger.info('Set global settings for nunjucks');
}

function initialisePublic(app) {
  app.use('/javascripts', express.static(path.join(__dirname, '..', '/node_modules/accessible-autocomplete/dist')));
  //app.use('/assets', express.static(path.join(__dirname, '/node_modules/govuk-frontend/assets')));
  app.use('/assets', express.static(path.join(__dirname, '/common/assets/')));
  app.use('/stylesheets', express.static(path.join(__dirname, '/public/stylesheets/')));
  app.use('/javascripts', express.static(path.join(__dirname, '/public/javascripts/')));
  app.use('/utils', express.static(path.join(__dirname, '/common/utils/')));
  logger.info('Initialised public assets');
}

function listRoutes(app) {
  logger.info('Registered routes:');
  app._router.stack.forEach((middleware) => {
    if (middleware.route) { // routes registered directly on the app
      logger.info(`${Object.keys(middleware.route.methods).join(', ').toUpperCase()} ${middleware.route.path}`);
    } else if (middleware.name === 'router') { // router middleware
      middleware.handle.stack.forEach((handler) => {
        if (handler.route) {
          logger.info(`${Object.keys(handler.route.methods).join(', ').toUpperCase()} ${handler.route.path}`);
        }
      });
    }
  });
}

function initialiseRoutes(app) {
  logger.info('Initialised router');
  router(app);
  // listRoutes(app);
  logger.info('Initialised routes');
}

function initialiseErrorHandling(app) {
  app.use((req, res) => {
    res.redirect('/error/404');
  });
  logger.info('Initialised error handling');
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

  // DB calls are asynchronous, need them executed before aspects like
  // sessions which talk to the DB are executed, so all other init calls
  // performed after initialiseDb
  async function prepDb() {
    try {
      await initialiseDb();
      initialisExpressSession(unconfiguredApp);
      initialiseProxy(unconfiguredApp);
      initialiseI18n(unconfiguredApp);
      initialiseGlobalMiddleware(unconfiguredApp);
      initialiseTemplateEngine(unconfiguredApp);
      initialiseRoutes(unconfiguredApp);
      initialisePublic(unconfiguredApp);
      initialiseErrorHandling(unconfiguredApp);
      logger.info('Initialised app: ');
    } catch (e) {
      logger.error("Prepping the database failed.")
      logger.error(e);
    }
  }
  prepDb();

  return unconfiguredApp;
}

function listen() {
  const app = initialise();
  app.listen(PORT);
  logger.info('App initialised');
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

export default {
  start,
  getApp: initialise,
};
