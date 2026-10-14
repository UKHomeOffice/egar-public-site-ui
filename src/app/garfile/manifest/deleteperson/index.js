const nav = require('../../../../common/utils/nav');
const postController = require('./post.controller');

// Export
module.exports = nav.buildGarRouterAndPaths('/garfile/manifest/deleteperson', null, postController);
