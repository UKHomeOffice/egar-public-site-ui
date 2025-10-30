const indexPath = '/upload';
const paths = {
  index: indexPath,
};

const express = require('express');
const multer = require('multer');
const bodyParser = require('body-parser');

const usercheck = require('../../../common/middleware/usercheck');
const csrfcheck = require('../../../common/middleware/csrfcheck');

const postController = require('./post.controller');

const app = express();
const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

app.use(bodyParser.json());

router.post(
  '/uploadgar',
  upload.single('file'),
  usercheck,
  csrfcheck,
  postController
);

module.exports = { router, paths };
