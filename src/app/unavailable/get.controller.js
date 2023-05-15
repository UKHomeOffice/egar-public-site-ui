const navUtil = require('../../common/utils/nav');
const availability = require('../../common/config/availability');

module.exports = (req, res) => {
  if (availability.ENABLE_UNAVAILABLE_PAGE.toLowerCase() === 'false') {
    res.redirect('/welcome/index')
  } else {
    navUtil.simpleGetRender(req, res, 'app/unavailable/index');
  };
}