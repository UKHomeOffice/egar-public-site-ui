const navUtil = require('../../../common/utils/nav');

module.exports = (req, res) => {
  navUtil.simpleGetRender(req, res, 'app/organisation/create/index');
};
