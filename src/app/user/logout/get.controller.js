const CookieModel = require('../../../common/models/Cookie.class');
const {getOneLoginLogoutUrl} = require("../../../common/utils/oneLoginAuth");
const {parseUrlForNonProd} = require("../../../common/services/oneLoginApi");

module.exports = (req, res) => {
  const cookie = new CookieModel(req);
  const {state, id_token, userDeleted} = req.cookies || {};

  if (state && id_token)  {
    req.session.destroy(() => {
      cookie.reset();
      const {state, id_token} = req.cookies;

      if (state && id_token)  {
        const logoutUrl = getOneLoginLogoutUrl(req, id_token, state);
        res.redirect(logoutUrl);
      }
    });
    return;
  }

  let redirectUrl = userDeleted === 'true' ? '/user/deleteconfirm' : '/welcome/index';

  req.session.destroy(() => {
    cookie.reset();
    const cookies = req.cookies;

    for (const cookieName in cookies) {
      res.clearCookie(cookieName);
    }

    res.redirect(redirectUrl);
  });
};
