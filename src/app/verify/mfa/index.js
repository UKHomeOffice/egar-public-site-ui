// Npm dependencies
import express from 'express';

import flagpole from '../../../common/middleware/flagpole.js';

import csrfcheck from '../../../common/middleware/csrfcheck.js';
import parseForm from '../../../common/middleware/parseForm.js';

import getController from './get.controller.js';

import postController from './post.controller.js';

// Initialisation
const router = new express.Router();
const indexPath = '/login/authenticate';
const paths = {
  index: indexPath,
};

// Routing
router.get(paths.index, flagpole, csrfcheck, getController);
router.post(paths.index, flagpole, parseForm, csrfcheck, postController);

// Export
export default { router, paths };
