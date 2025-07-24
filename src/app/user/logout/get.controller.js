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
  else if(req.query?.state === 'login-error') {
    return res.redirect('/error/loginError');
  } else if (req.query?.state === 'service-error') {
    return res.redirect('/error/oneLoginServiceError');
  } else if (req.query?.state === 'invite-expired') {
    return res.redirect('/error/inviteExpiredError');
  }

  //  if (req.query?.action === 'user-deleted') {
  //     state = 'user-deleted';
  //   }
  //   else if (req.query?.action === 'loginerror') {
  //     state = 'loginerror';
  //   }


  // If we detect valid OneLogin session cookies
  if (state && id_token) {
    if (req.query?.action !== null) {
      state = req.query.action;
    }

    const logoutUrl = getOneLoginLogoutUrl(req, id_token, state);

    res.clearCookie('id_token');
    res.clearCookie('state');
    return res.redirect(logoutUrl);
  }

  // Default logout path
  return logoutAndClearCookies(req, res, cookie, '/welcome/index');
};
