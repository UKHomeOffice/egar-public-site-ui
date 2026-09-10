// Npm dependencies
const express = require('express');

// Middleware
const flagpole = require('../../../common/middleware/flagpole');
const usercheck = require('../../../common/middleware/usercheck');
const csrfcheck = require('../../../common/middleware/csrfcheck');

// Local dependencies
const postController = require('./post.controller');
const getController = require('./get.controller');
const garCheckOwnership = require('../../../common/middleware/garOwnership');

// Initialisation
const router = new express.Router();
const indexPath = '/garfile/view';
const paths = {
  index: indexPath,
};

// Routing
router.post(paths.index, flagpole, usercheck, csrfcheck, garCheckOwnership, postController);
router.get(paths.index, flagpole, usercheck, csrfcheck, garCheckOwnership, getController);

// Export
module.exports = {
  router,
  paths,
};
