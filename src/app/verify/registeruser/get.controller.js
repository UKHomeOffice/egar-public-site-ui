const logger = require('../../../common/utils/logger')(__filename);
const CookieModel = require('../../../common/models/Cookie.class');
const verifyUserService = require('../../../common/services/verificationApi');

module.exports = (req, res) => {
  logger.debug('In verify / registeruser get controller');

  // Start by clearing cookies and initialising
  const cookie = new CookieModel(req);
  cookie.reset();
  cookie.initialise();

  // Look up and validate token, checking it hasn't expired
  const token = req.query.token;
  const hashedToken = verifyUserService.generateHash(token);

  logger.debug('Calling verify user endpoint');
  verifyUserService.verifyUser(hashedToken)
    .then((response) => {
      logger.debug(response);
      // TODO - Handle unhappy path
      // Check response for error message.
      // if found, render error messages
      res.render('app/verify/registeruser/index', { cookie });
    })
    .catch((err) => {
      logger.debug('Failed to verify token');
      logger.error(err);
    });
};
