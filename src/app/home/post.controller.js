const logger = require('../../common/utils/logger')(__filename);
const CookieModel = require('../../common/models/Cookie.class');

module.exports = (req, res) => {
  logger.debug('In register / reguser post controller');
  const cookie = new CookieModel(req);
  res.render('app/garfile/home/index', { cookie });
};
