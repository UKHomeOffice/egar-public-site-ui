// Npm dependencies
const express = require('express');

// Middleware
const paginate = require('express-paginate');
const flagpole = require('../../common/middleware/flagpole');
const usercheck = require('../../common/middleware/usercheck');
const csrfcheck = require('../../common/middleware/csrfcheck');
const parseForm = require('../../common/middleware/parseForm');

// Local dependencies
const getController = require('./get.controller');
const postController = require('./post.controller');

// Initialisation
const app = express();
const router = new express.Router();
app.use(paginate.middleware(10, 50));
const indexPath = '/aircraft';
const paths = {
  index: indexPath,
};

// Routing
router.get(paths.index, flagpole, usercheck, csrfcheck, getController);
router.post(paths.index, flagpole, usercheck, parseForm, csrfcheck, postController);

// Export
module.exports = { router, paths };
