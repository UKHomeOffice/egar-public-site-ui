const logger = require('../../../common/utils/logger')(__filename);
const CookieModel = require('../../../common/models/Cookie.class');
const tokenService = require('../../../common/services/create-token');

module.exports = (req, res) => {
  logger.debug('In verify / invite get controller');

  // Start by clearing cookies and initialising
  const cookie = new CookieModel(req);
  cookie.reset();
  cookie.initialise();

  // Look up and validate token, checking it hasn't expired
  const token = req.query.query;
  const hashedToken = tokenService.generateHash(token);
  cookie.setInviteUserToken(hashedToken);
  logger.info('Set hashedToken');
  res.render('app/verify/organisationinvite/index');
};
