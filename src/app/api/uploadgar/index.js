const indexPath = '/upload';
const paths = {
  index: indexPath,
};

const express = require('express');
const multer = require('multer');

const usercheck = require('../../../common/middleware/usercheck');
const csrfcheck = require('../../../common/middleware/csrfcheck');

const postController = require('./post.controller');

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post('/uploadgar', upload.single('file'), usercheck, csrfcheck, postController);

module.exports = { router, paths };
