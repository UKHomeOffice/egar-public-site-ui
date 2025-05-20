const CookieModel = require('../../../common/models/Cookie.class');
const {getOneLoginLogoutUrl} = require("../../../common/utils/oneLoginAuth");

module.exports = (req, res) => {
  const cookie = new CookieModel(req);
  const {state, id_token} = req.cookies || {};

  if (state && id_token)  {
    req.session.destroy(() => {
      cookie.reset();

      // Clear all cookies
      const cookies = req.cookies;
      for (const cookieName in cookies) {
        res.clearCookie(cookieName);
      }
      const {state, id_token} = req.cookies;

      if (state && id_token)  {
        const logoutUrl = getOneLoginLogoutUrl(id_token, state);
        res.redirect(logoutUrl);
      }
    });
    return;
  }

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
