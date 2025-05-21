const CookieModel = require('../../../common/models/Cookie.class');
const {getOneLoginLogoutUrl} = require("../../../common/utils/oneLoginAuth");
const logger = require('../../../common/utils/logger')(__filename);

module.exports = (req, res) => {
  const cookie = new CookieModel(req);

  if (req.cookies?.state && req.cookies?.id_token)  {
    logger.debug('Logging out of OneLogin');
    req.session.destroy(() => {
      cookie.reset();
      const {state, id_token} = req.cookies;
      for (const cookieName in req.cookies) {
        res.clearCookie(cookieName);
      }
      if (state && id_token)  {
        logger.debug('Redirecting to OneLogin');
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
