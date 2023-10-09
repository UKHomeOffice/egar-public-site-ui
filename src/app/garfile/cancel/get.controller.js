const logger = require('../../../common/utils/logger')(__filename);
const CookieModel = require('../../../common/models/Cookie.class');

module.exports = (req, res) => {
  logger.debug('In garfile / cancel get controller');
  const cookie = new CookieModel(req);
  logger.debug(`Cookies: ${JSON.stringify(cookie.session)}`)
  res.render('app/garfile/cancel/index', { cookie });
};
