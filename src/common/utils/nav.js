// Npm dependencies
import express from 'express';

import flagpole from '../../common/middleware/flagpole.js';

import usercheck from '../../common/middleware/usercheck.js';
import csrfcheck from '../../common/middleware/csrfcheck.js';
import parseForm from '../../common/middleware/parseForm.js';
import pageAccess from '../middleware/pageAccess.js';
import loggerFactory from './logger.js';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const logger = loggerFactory(__filename);
import CookieModel from '../models/Cookie.class.js';

const buildRouterAndPaths = (path, getController, postController) => {
  // Initialisation
  const router = new express.Router();
  const indexPath = path;
  const paths = {
    index: indexPath,
  };

  // Routing
  router.get(paths.index, flagpole, usercheck, csrfcheck, pageAccess, getController);
  if (postController) {
    router.post(paths.index, flagpole, usercheck, parseForm, csrfcheck, pageAccess, postController);
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

export default { simpleGetRender, buildRouterAndPaths, buildRouterAndPathsNoUserCheck };
