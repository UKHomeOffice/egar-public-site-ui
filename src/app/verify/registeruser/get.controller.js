const logger = require('../../../common/utils/logger')(__filename);
const CookieModel = require('../../../common/models/Cookie.class');
const tokenService = require('../../../common/services/create-token');
const verifyUserService = require('../../../common/services/verificationApi');

module.exports = (req, res) => {
  logger.debug('In verify / registeruser get controller');

  // Start by clearing cookies and initialising
  const cookie = new CookieModel(req);
  cookie.reset();
  cookie.initialise();

  // Look up and validate token, checking it hasn't expired
  const { token } = req.query;
  const hashedToken = tokenService.generateHash(token);

  logger.debug('Calling verify user endpoint');
  verifyUserService
    .verifyUser(hashedToken)
    .then((response) => {
      logger.debug(response);
      res.render('app/verify/registeruser/index', { cookie });
    })
    .catch((err) => {
      logger.debug('Failed to verify token');
      logger.error(err);
      res.render('app/verify/registeruser/index', {
        cookie,
        message:
          'There was an issue verifying your account. Please try again later.',
      });
    });
};
