const CookieModel = require('../../../../common/models/Cookie.class');
const logger = require('../../../../common/utils/logger');


module.exports = (req, res) => {
  const cookie = new CookieModel(req);

  logger.debug('In User / saved craft add get controller');
  res.render('app/user/savedcraft/add/index', { cookie });

};
