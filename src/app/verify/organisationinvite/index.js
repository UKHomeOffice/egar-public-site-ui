// Npm dependencies
const express = require('express');

// Middleware
const flagpole = require('../../../common/middleware/flagpole');
const csrfcheck = require('../../../common/middleware/csrfcheck');
const setting = require('../../../common/config/index');

// Local dependencies
const getController = require('./get.controller');

// Initialisation
const router = new express.Router();
let indexPath = '/verify/invite';

if (setting.ONE_LOGIN_SHOW_ONE_LOGIN === true || setting.ONE_LOGIN_POST_MIGRATION === true) {
  indexPath = '/verify/invite/onelogin';
}

const paths = {
  index: indexPath,
};

// Routing
router.get(paths.index, flagpole, csrfcheck, getController);

// Export
module.exports = {
  router,
  paths,
};
