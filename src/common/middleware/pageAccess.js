const CookieModel = require('../models/Cookie.class');
const logger = require('../utils/logger')(__filename);

module.exports = (req, res, next) => {
  const cookie = new CookieModel(req);
  const userRole = cookie.getUserRole(); 
  const canNotAccessPages = ['organisation'];
  const page = req.originalUrl.split('/')[1];

  if (userRole === 'User' &&  canNotAccessPages.includes(page)) {
    logger.info(`Can not access the ${page} page`);
    return res.redirect('/home');
  }
  next();
  return;

};
