const nav = require('../../common/utils/nav');

const postController = require('./post.controller');

module.exports = nav.buildRouterAndPathsNoUserCheck('/_/cspreports', null, postController);
