const CookieModel = require('../../../common/models/Cookie.class');
const logger = require('../../../common/utils/logger');

module.exports = (req, res) => {
  logger.debug('In user / deleteAccount get controller');
  const cookie = new CookieModel(req);
  res.render('app/user/deleteAccount/index', { cookie });
};
