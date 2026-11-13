// Npm dependencies
const express = require('express');

// Middleware
const flagpole = require('../../common/middleware/flagpole');
const usercheck = require('../../common/middleware/usercheck');
const csrfcheck = require('../../common/middleware/csrfcheck');
const pageAccess = require('../middleware/pageAccess');

const logger = require('./logger')(__filename);
const CookieModel = require('../models/Cookie.class');
const garAccessCheck = require('../middleware/garOwnership');

const buildRouterAndPaths = (path, getController, postController) => {
  // Initialisation
  const router = new express.Router();
  const paths = {
    index: path,
  };

  // Routing
  router.get(paths.index, flagpole, usercheck, csrfcheck, pageAccess, getController);
  if (postController) {
    router.post(paths.index, flagpole, usercheck, csrfcheck, pageAccess, postController);
  }

  return { router, paths };
};

const buildRouterAndPathsNoUserCheck = (path, getController, postController) => {
  // Initialisation
  const router = new express.Router();
  const paths = {
    index: path,
  };

  // Routing
  router.get(paths.index, flagpole, csrfcheck, getController);
  if (postController) {
    router.post(paths.index, flagpole, csrfcheck, postController);
  }

  return { router, paths };
};

/**
 * Some pages just simply create a Cookie instance of the request and render
 * the response for the given page. So this is a convenience method to perform
 * that step.
 *
 * @param req Object incoming request
 * @param res Object outgoing response
 * @param page page to render
 */
const simpleGetRender = (req, res, page) => {
  logger.info(`Rendering page ${page}`);
  const cookie = new CookieModel(req);
  res.render(page, { cookie });
};

const defaultMiddleware = [flagpole, usercheck, csrfcheck];

const garMiddlewares = (initialMiddleware = []) => {
  let middlewares = defaultMiddleware;

  if (initialMiddleware) {
    middlewares = [...initialMiddleware];
  }

  middlewares.push(garAccessCheck);
  return middlewares;
};

/**
 *  A utility function for building route with the ability to dynamically add middlewares are needed.
 *
 * @param router express.Router
 * @param path string
 * @param method string
 * @param middlewares Array - list of middleware to pass before controller
 * @param controller function - controller to instantiate
 */
const buildRoute = (router, path, method, middlewares, controller) => {
  let middlewareConfig = middlewares || defaultMiddleware;

  switch (method.toUpperCase()) {
    case 'GET':
      router.get(path, ...middlewareConfig, controller);
      break;
    case 'POST':
      router.post(path, ...middlewareConfig, controller);
      break;
    case 'DELETE':
      router.delete(path, ...middlewareConfig, controller);
      break;
    default:
      throw new Error(`Unsupported method ${method.toUpperCase()}`);
  }

  return router;
};

const buildGarRouterAndPaths = (path, getController, postController, middlewares = []) => {
  const router = new express.Router();
  const paths = { index: path };

  const getMiddlewares = [flagpole, usercheck, csrfcheck, pageAccess, garAccessCheck, ...middlewares];
  const postMiddlewares = [flagpole, usercheck, csrfcheck, garAccessCheck, ...middlewares];

  if (getController) {
    buildRoute(router, paths.index, 'GET', getMiddlewares, getController);
  }

  if (postController) {
    buildRoute(router, paths.index, 'POST', postMiddlewares, postController);
  }

  return { router, paths };
};

module.exports = {
  simpleGetRender,
  buildRouterAndPaths,
  buildRouterAndPathsNoUserCheck,
  buildRoute,
  buildGarRouterAndPaths,
  garMiddlewares,
  defaultMiddleware,
};
