// Npm dependencies
import express from 'express';

import getController from './get.controller.js';

// Initialisation
const router = new express.Router();
const indexPath = '/help';
const paths = {
  index: indexPath,
};

// Routing
router.get(paths.index, getController);

// Export
export default {
  router,
  paths,
};
