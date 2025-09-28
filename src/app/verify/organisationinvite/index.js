// Npm dependencies
import express from 'express';

import flagpole from '../../../common/middleware/flagpole.js';

import csrfcheck from '../../../common/middleware/csrfcheck.js';
import parseForm from '../../../common/middleware/parseForm.js';
import setting from '../../../common/config/index.js';

import getController from './get.controller.js';

// Initialisation
const router = new express.Router();
let indexPath = '/verify/invite';

if(setting.ONE_LOGIN_SHOW_ONE_LOGIN === true || setting.ONE_LOGIN_POST_MIGRATION === true){
   indexPath = '/verify/invite/onelogin';
}

const paths = {
  index: indexPath,
};

// Routing
router.get(paths.index, flagpole,  csrfcheck, getController);

// Export
export default {
  router,
  paths,
};
