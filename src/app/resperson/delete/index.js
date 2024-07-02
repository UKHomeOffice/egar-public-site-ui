const express = require('express');
const flagpole = require('../../../common/middleware/flagpole');
const usercheck = require('../../../common/middleware/usercheck');
const getController = require('./get.controller');

const router = new express.Router();
const indexPath = '/resperson/delete';
const paths = {
  index: indexPath,
};

router.get(paths.index, flagpole, usercheck, getController);

module.exports = { router, paths };
