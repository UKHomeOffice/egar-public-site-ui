const nav = require('../../../../common/utils/nav');

// Local dependencies
const getController = require('./get.controller');

module.exports = nav.buildRouterAndPaths('/garfile/submit/failure', getController);
