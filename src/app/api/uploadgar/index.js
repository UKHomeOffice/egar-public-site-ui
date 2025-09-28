const indexPath = '/upload';
const paths = {
  index: indexPath,
};

import express from 'express';
import multer from 'multer';
import bodyParser from 'body-parser';
import usercheck from '../../../common/middleware/usercheck.js';
import csrfcheck from '../../../common/middleware/csrfcheck.js';
import postController from './post.controller.js';

const app = express();
const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

app.use(bodyParser.json());

router.post('/uploadgar', upload.single('file'), usercheck, csrfcheck, postController);

export default { router, paths };
