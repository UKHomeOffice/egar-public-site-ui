const logger = require('../../../common/utils/logger')(__filename);
const CookieModel = require('../../../common/models/Cookie.class');

module.exports = (req, res) => {
  logger.debug('In garfile / cancel get controller');
  const cookie = new CookieModel(req);
  logger.info("CBP id: " + cookie.getCbpId())
  res.render('app/garfile/cancel/index', { cookie });
};
