// Npm dependencies
const express = require('express');

// Middleware
const flagpole = require('../../../common/middleware/flagpole');
const csrfcheck = require('../../../common/middleware/csrfcheck');
const parseForm = require('../../../common/middleware/parseForm');

// Local dependencies
const getController = require('./get.controller');
const postController = require('./post.controller');

// Initialisation
const router = new express.Router();
const indexPath = '/user/register';
const paths = {
  index: indexPath,
};

// Routing
router.get(paths.index, flagpole, csrfcheck, getController);
router.post(paths.index, flagpole, parseForm, csrfcheck, postController);

// Export
module.exports = { router, paths };
