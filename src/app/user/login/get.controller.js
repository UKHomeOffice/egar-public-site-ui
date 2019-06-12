const logger = require('../../../common/utils/logger')(__filename);
const CookieModel = require('../../../common/models/Cookie.class');

module.exports = (req, res) => {
  const cookie = new CookieModel(req);
  logger.debug('In register / user get controller');
  res.render('app/user/login/index', { cookie });
};
