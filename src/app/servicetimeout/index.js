const express = require('express');

const router = express.Router();
const getController = require('./get.controller');
const postController = require('./post.controller');

router.get('/servicetimeout/:action', getController);
router.post('/servicetimeout', postController);

module.exports = { router };
