const CookieModel = require('../models/Cookie.class');
const logger = require('../utils/logger')(__filename);

const permissions = {
  'organisation': ['User'],
  'assignrole': ['User'],
}


module.exports = (req, res, next) => {
  const cookie = new CookieModel(req);
  const userRole = cookie.getUserRole();
  const page = req.originalUrl.split('/')[1];

  if (!!permissions[page] && permissions[page].includes(userRole)) {
    logger.info(`Can not access the ${page} page`);
    return res.redirect('/home');
  }

  next()
};
