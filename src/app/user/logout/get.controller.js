const CookieModel = require('../../../common/models/Cookie.class');
const { getOneLoginLogoutUrl } = require("../../../common/utils/oneLoginAuth");

function logoutAndClearCookies(req, res, cookie, redirectUrl) {
  req.session.destroy(() => {
    cookie.reset();
    // Clear all cookies
    const cookies = req.cookies;
    for (const cookieName in cookies) {
      res.clearCookie(cookieName);
    }
    res.redirect(redirectUrl);
  });
}

module.exports = (req, res) => {
  const cookie = new CookieModel(req);
  let { state, id_token } = req.cookies || {};

  // If returning from Onelogin with a "user-deleted" state
  if (req.query?.state === 'user-deleted') {
    return logoutAndClearCookies(req, res, cookie, '/user/deleteconfirm');
  }

  // If we detect valid OneLogin session cookies
  if (state && id_token) {
    if (req.query?.action === 'user-deleted') {
      state = 'user-deleted';
    }

    const logoutUrl = getOneLoginLogoutUrl(req, id_token, state);
    return logoutAndClearCookies(req, res, cookie, logoutUrl);
  }

  // Default logout path
  return logoutAndClearCookies(req, res, cookie, '/welcome/index');
};
