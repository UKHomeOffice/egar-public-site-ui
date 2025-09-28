// Npm dependencies
import express from 'express';

import flagpole from '../../../../common/middleware/flagpole.js';

import usercheck from '../../../../common/middleware/usercheck.js';

import postController from './post.controller.js';

// Initialisation
const router = new express.Router();
const indexPath = '/garfile/manifest/deleteperson';
const paths = {
  index: indexPath,
};

// Routing
router.post(paths.index, flagpole, usercheck, postController);

// Export
export default {
  router,
  paths,
};
