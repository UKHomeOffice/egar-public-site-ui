// Npm dependencies
import express from 'express';

import flagpole from '../../../common/middleware/flagpole.js';

import usercheck from '../../../common/middleware/usercheck.js';
import csrfcheck from '../../../common/middleware/csrfcheck.js';
import parseForm from '../../../common/middleware/parseForm.js';
import pageAccess from '../../../common/middleware/pageAccess.js';

import getController from './get.controller.js';

import postController from './post.controller.js';

// Initialisation
const router = new express.Router()
const indexPath = '/organisation/assignrole'
const paths = {
  index: indexPath 
}

// Routing
router.get(paths.index, flagpole, usercheck,csrfcheck, pageAccess, getController);
router.post(paths.index, flagpole, usercheck, parseForm, csrfcheck,pageAccess, postController);

// Export
export default {
  router, paths
};
