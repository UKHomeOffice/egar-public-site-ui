// Npm dependencies
const express = require('express');

// Middleware
const flagpole = require('../../common/middleware/flagpole');
const usercheck = require('../../common/middleware/usercheck');
const csrfcheck = require('../../common/middleware/csrfcheck');
const parseForm = require('../../common/middleware/parseForm');

const logger = require('./logger')(__filename);
const CookieModel = require('../models/Cookie.class');

const buildRouterAndPaths = (path, getController, postController) => {
  // Initialisation
  const router = new express.Router();
  const indexPath = path;
  const paths = {
    index: indexPath,
  };

  // Routing
  router.get(paths.index, flagpole, usercheck, csrfcheck, getController);
  if (postController) {
    router.post(paths.index, flagpole, usercheck, parseForm, csrfcheck, postController);
  }

  return { router, paths };
};

const buildRouterAndPathsNoUserCheck = (path, getController, postController) => {
  // Initialisation
  const router = new express.Router();
  const indexPath = path;
  const paths = {
    index: indexPath,
  };

  // Routing
  router.get(paths.index, flagpole, csrfcheck, getController);
  if (postController) {
    router.post(paths.index, flagpole, parseForm, csrfcheck, postController);
  }

  return { router, paths };
};

/**
 * Some pages just simply create a Cookie instance of the request and render
 * the response for the given page. So this is a convenience method to perform
 * that step.
 *
 * @param {} req incoming request
 * @param {*} res outgoing response
 * @param {*} page page to render
 */
const simpleGetRender = (req, res, page) => {
  logger.info(`Rendering page ${page}`);
  const cookie = new CookieModel(req);
  res.render(page, { cookie });
};

exports.simpleGetRender = simpleGetRender;
exports.buildRouterAndPaths = buildRouterAndPaths;
exports.buildRouterAndPathsNoUserCheck = buildRouterAndPathsNoUserCheck;
