const CookieModel = require('../../../../common/models/Cookie.class');
const logger = require('../../../../common/utils/logger');


module.exports = (req, res) => {
  const cookie = new CookieModel(req);

  logger.debug('In organisation / saved craft add get controller');
  res.render('app/organisation/savedcraft/add/index', { cookie });
};
