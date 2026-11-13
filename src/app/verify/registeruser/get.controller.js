const logger = require('../../../common/utils/logger')(__filename);
const CookieModel = require('../../../common/models/Cookie.class');
const tokenService = require('../../../common/services/create-token');
const verifyUserService = require('../../../common/services/verificationApi');

module.exports = (req, res) => {
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
      logger.error('Failed to verify token', { errorMessage: err?.message, stack: err?.stack });
      res.render('app/verify/registeruser/index', {
        cookie,
        message: 'There was an issue verifying your account. Please try again later.',
      });
    });
};
