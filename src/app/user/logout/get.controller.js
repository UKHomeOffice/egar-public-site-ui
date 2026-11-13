const CookieModel = require('../../../common/models/Cookie.class');
const { getOneLoginLogoutUrl } = require('../../../common/utils/oneLoginAuth');

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
  let { state } = req.cookies || {};
  const idToken = req.session?.id_token;

  // If returning from Onelogin with a "user-deleted" state after delete confirm
  if (req.query?.state === 'user-deleted') {
    return logoutAndClearCookies(req, res, cookie, '/user/deleteconfirm');
  }

  // One login sign path
  if (state && idToken) {
    if (req.query?.action === 'user-deleted') {
      state = 'user-deleted';
    }

    const logoutUrl = getOneLoginLogoutUrl(req, idToken, state);
    res.clearCookie('state');
    return res.redirect(logoutUrl);
  }

  if (req.cookies.serviceTimeout && req.cookies.serviceTimeout === 'yes') {
    return logoutAndClearCookies(req, res, cookie, '/servicetimeout/signout');
  }
  // Default logout path
  return logoutAndClearCookies(req, res, cookie, '/welcome/index');
};
