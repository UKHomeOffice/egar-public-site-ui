const CookieModel = require('../../common/models/Cookie.class');
const logger = require('../utils/logger')(__filename);

const checkUserInCookie = (cookie) => {
  const userDbIdNotSet = cookie.getUserDbId() === undefined || cookie.getUserDbId() === null;
  const userVerifiedNotSet = cookie.getUserVerified() === undefined || cookie.getUserVerified() === null || !cookie.getUserVerified();
  const userRoleNotSet = cookie.getUserRole() === undefined || cookie.getUserRole() === null;
  console.log(userDbIdNotSet, userVerifiedNotSet, userRoleNotSet);
  return userDbIdNotSet || userVerifiedNotSet || userRoleNotSet;
};


module.exports = (req, res, next) => {

  const cookie = new CookieModel(req);

  // Checking for a blank referer appears to prevent a user from entering a URL in the browser
  // which may have been intended, but also seems a little off.
  if (req.headers.referer === undefined || checkUserInCookie(cookie)) {
    if (req.headers.referer === undefined) {
      logger.info('About to redirect to login because the referer in headers is not set');
    }
    if (checkUserInCookie(cookie)) {
      logger.info('About to redirect to login because the user is not set in the cookie');
    }
    res.redirect('/welcome/index');
  } else {
    next();
  }
};
