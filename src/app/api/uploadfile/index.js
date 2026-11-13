const express = require('express');
const multer = require('multer');
const config = require('../../../common/config');
const usercheck = require('../../../common/middleware/usercheck');
const csrfcheck = require('../../../common/middleware/csrfcheck');
const logger = require('../../../common/utils/logger')(__filename);
const garAccessCheck = require('../../../common/middleware/garOwnership');

const postController = require('./post.controller');

const router = express.Router();
const indexPath = '/upload';
const paths = {
  index: indexPath,
};
const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: config.SUPPORTING_DOCS_MAX_SIZE } }).single('file');

router.post(
  paths.index,
  usercheck,
  (req, res, next) => {
    upload(req, res, (err) => {
      if (err) {
        logger.warn('File rejected due to size at multer level');
        return res.redirect('/garfile/supportingdocuments?query=limit');
      }
      next(err);
    });
  },
  csrfcheck,
  garAccessCheck,
  postController
);

module.exports = { router, paths };
