
const logger = require('../../../common/utils/logger')(__filename);
const CookieModel = require('../../../common/models/Cookie.class')


module.exports = (req, res) => {
  logger.debug('In organisation / inviteusers get controller');
  const cookie = new CookieModel(req);
  res.render('app/organisation/inviteusers/index', { cookie });
};
