const getController = require('./get.controller');
const postController = require('./post.controller');
const nav = require('../../../../common/utils/nav');

module.exports = nav.buildRouterAndPaths('/garfile/amg/departure', getController, postController);
