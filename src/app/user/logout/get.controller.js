const CookieModel = require('../../../common/models/Cookie.class');
const {getOneLoginLogoutUrl} = require("../../../common/utils/oneLoginAuth");

module.exports = (req, res) => {
  const cookie = new CookieModel(req);
  let {state, id_token} = req.cookies || {};

  // check if we coming back from Onelogin
  if (req.query.state === 'user-deleted') {
    req.session.destroy(() => {
      cookie.reset();
      // Clear all cookies
      const cookies = req.cookies;
      for (const cookieName in cookies) {
        res.clearCookie(cookieName);
      }

      res.redirect('/user/deleteconfirm');
    });
    return;
  }


  if (state && id_token)  {
    if (req.query.action === 'user-deleted') {
     state = 'user-deleted'
    }
    const logoutUrl = getOneLoginLogoutUrl(req, id_token, state);
    res.redirect(logoutUrl);
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
