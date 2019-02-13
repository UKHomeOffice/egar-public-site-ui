// Npm dependencies
const express = require('express');

// Middleware
const flagpole = require('../../../../common/middleware/flagpole');
const usercheck = require('../../../../common/middleware/usercheck');

// Local dependencies
const getController = require('./get.controller');

// Initialisation
const router = new express.Router();
const indexPath = '/organisation/savedcraft/delete';
const paths = {
  index: indexPath,
};

// Routing
router.get(paths.index, flagpole, usercheck, getController);

// Export
module.exports = {
  router,
  paths,
};
