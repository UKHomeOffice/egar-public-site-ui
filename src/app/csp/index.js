const nav = require('../../common/utils/nav');

// TODO figure out which controller is needed
const getController = require('./get.controller');
const postController = require('./post.controller');

module.exports = nav.buildRouterAndPathsNoUserCheck('/_/cspreports', getController, postController);
