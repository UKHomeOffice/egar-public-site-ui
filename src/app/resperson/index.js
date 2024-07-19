const nav = require('../../common/utils/nav');
const getController = require('./get.controller');

module.exports = nav.buildRouterAndPaths('/resperson', getController);
