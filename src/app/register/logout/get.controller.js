const CookieModel = require('../../../common/models/Cookie.class');

module.exports = (req, res) => {
  const cookie = new CookieModel(req);
  req.session.destroy(() => {
    cookie.reset();

    // Clear all cookies
    const cookies = req.cookies;
    for (const cookieName in cookies) {
      res.clearCookie(cookieName);
    }

    res.redirect('/welcome/index');
  });
};
