const express = require('express');

const flagpole = require('../../common/middleware/flagpole');
const usercheck = require('../../common/middleware/usercheck');
const csrfcheck = require('../../common/middleware/csrfcheck');
const parseForm = require('../../common/middleware/parseForm');

const getController = require('./get.controller.js');
const postController = require('./post.controller.js');

const router = new express.Router();
const indexPath = '/organisation';

const paths = {
  index: indexPath,
};

router.get(paths.index, flagpole, usercheck, csrfcheck, getController);
router.post(paths.index, flagpole, usercheck, parseForm, csrfcheck, postController);

module.exports = { router, paths };
