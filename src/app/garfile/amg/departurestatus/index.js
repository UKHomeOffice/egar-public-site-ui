const getController = require('./get.controller');
const nav = require('../../../../common/utils/nav');

module.exports = nav.buildRouterAndPaths('/garfile/amg/departurestatus', getController);