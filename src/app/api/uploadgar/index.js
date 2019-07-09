const indexPath = '/upload';
const paths = {
  index: indexPath,
};

const express = require('express');

const app = express();
const router = express.Router();
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage });
const bodyParser = require('body-parser');
const csrf = require('csurf');
const logger = require('../../../common/utils/logger')(__filename);

const csrfProtection = csrf({ cookie: true });
const parseForm = bodyParser.urlencoded({ extended: false });
const postController = require('./post.controller');

app.use(bodyParser.json());

// TODO: Delete this?
router.get('/uploadgar', (req, res) => {
  res.json({ message: 'welcome to our upload module apis' });
});

router.post('/uploadgar', upload.single('file'), postController);

module.exports = {
  router,
  paths,
};
