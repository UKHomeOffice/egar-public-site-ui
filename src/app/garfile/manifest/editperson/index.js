// Npm dependencies
const express = require('express');

// Middleware
const flagpole = require('../../../../common/middleware/flagpole');
const usercheck = require('../../../../common/middleware/usercheck');
const csrfcheck = require('../../../../common/middleware/csrfcheck');

// Local dependencies
const postController = require('./post.controller');
const getController = require('./get.controller');
const garCheckMiddleware = require('../../../../common/middleware/garOwnership');

// Initialisation
const router = new express.Router();
const indexPath = '/garfile/manifest/editperson';
const paths = {
  index: indexPath,
};

const ownershipCheck = garCheckMiddleware;

// Routing
router.get(paths.index, flagpole, usercheck, csrfcheck, ownershipCheck, getController);
router.post(paths.index, flagpole, usercheck, csrfcheck, ownershipCheck, postController);

// Export
module.exports = {
  router,
  paths,
};
