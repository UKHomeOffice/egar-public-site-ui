const navUtil = require('../../../common/utils/nav');

module.exports = (req, res) => {
  navUtil.simpleGetRenderWithQuery(req, res, 'app/aircraft/add/index');
};
