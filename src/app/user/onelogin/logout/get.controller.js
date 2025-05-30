const {getOneLoginLogoutUrl} = require("../../../../common/utils/oneLoginAuth");
const CookieModel = require('../../../../common/models/Cookie.class');

module.exports = (req, res) => {
  // Destroy session and clear cookies before redirecting
  if (req.session) {
    const cookie = new CookieModel(req);
    req.session.destroy(() => {
      cookie.reset();

      // Clear all cookies
      const cookies = req.cookies;
      for (const cookieName in cookies) {
        res.clearCookie(cookieName);
      }
      const {state, id_token} = req.cookies;

      if (state && id_token)  {
        const logoutUrl = getOneLoginLogoutUrl(req, id_token, state);
        res.redirect(logoutUrl);
      }
    });
  } else {
    // If no session, just clear cookies and redirect
    const cookies = req.cookies;
    for (const cookieName in cookies) {
      res.clearCookie(cookieName);
    }
    res.redirect('/welcome/index');
  }
};
