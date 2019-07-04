// Npm dependencies
const express = require('express');

// Middleware
const flagpole = require('../../../common/middleware/flagpole');
const usercheck = require('../../../common/middleware/usercheck');
const csrfcheck = require('../../../common/middleware/csrfcheck');

// Local dependencies
const getController = require('./get.controller');

// Initialisation
const router = new express.Router();
const indexPath = '/user/logout';
const paths = {
  index: indexPath,
};

// Routing
router.get(paths.index, flagpole, usercheck, csrfcheck, getController);

// Export
module.exports = { router, paths };
