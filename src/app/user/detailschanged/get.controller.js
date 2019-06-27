const CookieModel = require('../../../common/models/Cookie.class');

module.exports = (req, res) => {
  var cookie = new CookieModel(req);
  res.render('app/user/detailschanged/index',{ cookie });
};
