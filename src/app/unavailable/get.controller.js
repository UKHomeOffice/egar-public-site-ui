const navUtil = require('../../common/utils/nav');
const availability = require('../../common/config/availability');

if (availability.ENABLE_UNAVAILABLE_PAGE.toLowerCase() === 'false') {
  module.exports = (req, res) => {
    res.redirect('/welcome/index');
  };
} else {
  module.exports = (req, res) => {
    navUtil.simpleGetRender(req, res, 'app/unavailable/index');
  };
}
