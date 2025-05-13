const {getOneLoginLogoutUrl} = require("../../../../common/utils/oneLoginAuth");
const CookieModel = require('../../../../common/models/Cookie.class');

module.exports = (req, res) => {
  const {state, id_token} = req.cookies;
  if (!state) {
    throw new Error('No state in cookies');
  }

  if (!id_token) {
    throw new Error('No state in cookies');
  }

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

      const logoutUrl = getOneLoginLogoutUrl(id_token, state);
      res.redirect(logoutUrl);
    });
  } else {
    // If no session, just clear cookies and redirect
    const cookies = req.cookies;
    for (const cookieName in cookies) {
      res.clearCookie(cookieName);
    }

    const logoutUrl = getOneLoginLogoutUrl(id_token, state);
    res.redirect(logoutUrl);
  }
};
