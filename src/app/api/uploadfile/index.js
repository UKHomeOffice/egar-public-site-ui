const express = require('express');
const multer = require('multer');

const logger = require('../../../common/utils/logger')(__filename);

const postController = require('./post.controller');

const router = express.Router();
const indexPath = '/upload';
const paths = {
  index: indexPath,
};
const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: (1024 ** 2) * 8 } }).single('file');

router.post(paths.index, (req, res, next) => {
  upload(req, res, (err) => {
    if (err) {
      logger.info('File rejected due to size at multer level');
      return res.redirect('/garfile/supportingdocuments?query=limit');
    }
    next(err);
  });
}, postController);

module.exports = { router, paths };
