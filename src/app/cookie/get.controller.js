const CookieModel = require('../../common/models/Cookie.class');

module.exports = (req, res) => {
  const cookie = new CookieModel(req);

  res.render('app/cookie/index', {
    cookie,
    isLoggedIn: Boolean(cookie.getUserDbId()),
  });
};
