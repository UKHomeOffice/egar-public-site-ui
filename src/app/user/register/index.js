const nav = require('../../../common/utils/nav');

// Local dependencies
const getController = require('./get.controller');
const postController = require('./post.controller');

module.exports = nav.buildRouterAndPaths('/user/register', getController, postController);
