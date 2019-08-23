const CookieModel = require('../../../common/models/Cookie.class');

module.exports = (req, res) => {
  const cookie = new CookieModel(req);
  req.session.destroy(() => {
    cookie.reset();
    res.redirect('/welcome/index');
  });
};
