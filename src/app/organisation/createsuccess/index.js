// Npm dependencies
import express from 'express';

import flagpole from '../../../common/middleware/flagpole.js';

import usercheck from '../../../common/middleware/usercheck.js';
import csrfcheck from '../../../common/middleware/csrfcheck.js';

import getController from './get.controller.js';

// Initialisation
const router = new express.Router();
const indexPath = '/organisation/createsuccess';
const paths = {
  index: indexPath,
};

// Routing
router.get(paths.index, flagpole, usercheck, csrfcheck, getController);

// Export
export default { router, paths };
