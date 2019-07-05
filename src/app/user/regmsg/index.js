// Npm dependencies
const express = require('express');

// Middleware
const flagpole = require('../../../common/middleware/flagpole');
const csrfcheck = require('../../../common/middleware/csrfcheck');

// Local dependencies
const getController = require('./get.controller');

// Initialisation
const router = new express.Router();
const indexPath = '/user/regmsg';
const paths = {
  index: indexPath,
};

// Routing
router.get(paths.index, flagpole, csrfcheck, getController);

// Export
module.exports = { router, paths };
