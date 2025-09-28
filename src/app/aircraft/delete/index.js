// Npm dependencies
import express from 'express';

import flagpole from '../../../common/middleware/flagpole.js';

import usercheck from '../../../common/middleware/usercheck.js';

import getController from './get.controller.js';

// Initialisation
const router = new express.Router();
const indexPath = '/aircraft/delete';
const paths = {
  index: indexPath,
};

// Routing
router.get(paths.index, flagpole, usercheck, getController);

// Export
export default { router, paths };
