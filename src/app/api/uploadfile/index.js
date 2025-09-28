import express from 'express';
import multer from 'multer';
import loggerFactory from '../../../common/utils/logger.js';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const logger = loggerFactory(__filename);
import postController from './post.controller.js';

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

export default { router, paths };
