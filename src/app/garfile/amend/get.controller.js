const logger = require('../../../common/utils/logger')(__filename);
const CookieModel = require('../../../common/models/Cookie.class');

module.exports = (req, res) => {
  logger.debug('In garfile / amend get controller');
  const cookie = new CookieModel(req);

  res.render('app/garfile/amend/index', { cookie });
};
