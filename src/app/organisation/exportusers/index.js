const nav = require('../../../common/utils/nav');

// Local dependencies
const getController = require('./get.controller');

module.exports = nav.buildRouterAndPaths('/organisation/users/export', getController);