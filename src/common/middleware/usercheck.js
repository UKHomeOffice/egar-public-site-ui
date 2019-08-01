const CookieModel = require('../../common/models/Cookie.class');
const logger = require('../utils/logger')(__filename);

module.exports = (req, res, next) => {
  const cookie = new CookieModel(req);

  // Checking for a blank referer appears to prevent a user from entering a URL in the browser
  // which may have been intended, but also seems a little off.
  if (req.headers.referer === undefined || cookie.getUserDbId() === undefined || cookie.getUserDbId() === null) {
    if (req.headers.referer === undefined) {
      logger.info('About to redirect to login because the referer in headers is not set');
    }
    if (cookie.getUserDbId() === undefined || cookie.getUserDbId() === null) {
      logger.info('About to redirect to login because the user is not set in the cookie');
    }
    res.redirect('/welcome/index');
  } else {
    next();
  }
};
