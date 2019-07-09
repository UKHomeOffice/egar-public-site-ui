const indexPath = '/upload';
const paths = {
  index: indexPath,
};

const express = require('express');
const multer = require('multer');
const bodyParser = require('body-parser');
const csrf = require('csurf');

const csrfProtection = csrf({ cookie: true });
const postController = require('./post.controller');

const app = express();
const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

app.use(bodyParser.json());

// TODO: Delete this?
router.get('/uploadgar', (req, res) => {
  res.json({ message: 'welcome to our upload module apis' });
});

router.post('/uploadgar', upload.single('file'), postController);

module.exports = { router, paths };
