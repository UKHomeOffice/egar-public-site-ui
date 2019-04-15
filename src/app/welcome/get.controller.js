const logger = require('../../common/utils/logger');
const CookieModel = require('../../common/models/Cookie.class');

module.exports = (req, res) => {
  logger.debug('In welcome get controller');
  const cookie = new CookieModel(req);
  res.render('app/unavailable/index', { cookie });
};
