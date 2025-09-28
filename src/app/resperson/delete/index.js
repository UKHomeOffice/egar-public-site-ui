import express from 'express';
import flagpole from '../../../common/middleware/flagpole.js';
import usercheck from '../../../common/middleware/usercheck.js';
import getController from './get.controller.js';

const router = new express.Router();
const indexPath = '/resperson/delete';
const paths = {
  index: indexPath,
};

router.get(paths.index, flagpole, usercheck, getController);

export default { router, paths };
