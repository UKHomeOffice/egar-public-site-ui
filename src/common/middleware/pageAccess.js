const CookieModel = require('../models/Cookie.class');
const logger = require('../utils/logger')(__filename);

module.exports = (roles) =>
  (req, res, next) => {
  const cookie = new CookieModel(req);
  const userRole = cookie.getUserRole();

  if (!roles.includes(userRole) === false) {
    logger.info(`Can not access the page`);
    return res.redirect('/home');
  }
  next();
};
