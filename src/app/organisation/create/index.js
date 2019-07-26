// Npm dependencies
const express = require('express');

// Middleware
const flagpole = require('../../../common/middleware/flagpole');
const usercheck = require('../../../common/middleware/usercheck');
const individualCheck = require('../../../common/middleware/individualCheck');
const csrfcheck = require('../../../common/middleware/csrfcheck');
const parseForm = require('../../../common/middleware/parseForm');

// Local dependencies
const getController = require('./get.controller');
const postController = require('./post.controller');

// Initialisation
const router = new express.Router();
const indexPath = '/organisation/create';
const paths = {
  index: indexPath,
};

// Routing
router.get(paths.index, flagpole, usercheck, individualCheck, csrfcheck, getController);
router.post(paths.index, flagpole, usercheck, individualCheck, parseForm, csrfcheck, postController);

// Export
module.exports = { router, paths };
