const CookieModel = require('../../common/models/Cookie.class');

module.exports = (req, res, next) => {
  const cookie = new CookieModel(req);
  if (req.headers.referer === undefined
      || cookie.getUserDbId() === undefined
      || cookie.getUserDbId() === null) {
    res.redirect('/login');
  } else {
    next();
  }
};
