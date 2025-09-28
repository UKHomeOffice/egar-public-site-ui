// Npm dependencies
import express from 'express';

import flagpole from '../../../common/middleware/flagpole.js';

import csrfcheck from '../../../common/middleware/csrfcheck.js';

import getController from './get.controller.js';

// Initialisation
const router = new express.Router();
const indexPath = '/user/regmsg';
const paths = {
  index: indexPath,
};

// Routing
router.get(paths.index, flagpole, csrfcheck, getController);

// Export
export default { router, paths };
