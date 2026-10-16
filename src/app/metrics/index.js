const express = require('express');

const router = new express.Router();
const controller = require('./get.controller');

router.get('/metrics', controller);

module.exports = {
  router,
};
