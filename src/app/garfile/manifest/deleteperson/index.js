// Npm dependencies
const express = require('express');

// Middleware
const flagpole = require('../../../../common/middleware/flagpole');
const usercheck = require('../../../../common/middleware/usercheck');

// Local dependencies
const postController = require('./post.controller');

// Initialisation
const router = new express.Router();
const indexPath = '/garfile/manifest/deleteperson';
const paths = {
  index: indexPath,
};

// Routing
router.post(paths.index, flagpole, usercheck, postController);

// Export
module.exports = {
  router,
  paths,
};
