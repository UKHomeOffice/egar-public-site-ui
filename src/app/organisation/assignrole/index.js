// Npm dependencies
const express = require('express')

// Middleware
const flagpole = require('../../../common/middleware/flagpole')
const usercheck = require('../../../common/middleware/usercheck');
const csrfcheck = require('../../../common/middleware/csrfcheck')
const parseForm = require('../../../common/middleware/parseForm');
const pageAccess = require('../../../common/middleware/pageAccess');

// Local dependencies
const getController = require('./get.controller')
const postController = require('./post.controller')

// Initialisation
const router = new express.Router()
const indexPath = '/organisation/assignrole'
const paths = {
  index: indexPath
}

// Routing
router.get(paths.index, flagpole, usercheck,csrfcheck, pageAccess(["Admin", "Manager"]), getController);
router.post(paths.index, flagpole, usercheck, parseForm, csrfcheck,pageAccess(["Admin", "Manager"]), postController);

// Export
module.exports = {
  router, paths
}
