const CookieModel = require('../../../common/models/Cookie.class');
const logger = require('../../../common/utils/logger');

module.exports = (req, res) => {
  logger.debug('In user / register get controller');
  const cookie = new CookieModel(req);

  // const tokenid = req.queryid
  // call api to verify token ( pass token to the API)
  // add to cookie verification
  // add iuserr details to cookie

  res.render('app/user/register/index', { cookie });
};
