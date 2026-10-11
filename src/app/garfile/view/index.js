const nav = require('../../../common/utils/nav');
const postController = require('./post.controller');
const getController = require('./get.controller');

module.exports = nav.buildGarRouterAndPaths('/garfile/view', getController, postController);
