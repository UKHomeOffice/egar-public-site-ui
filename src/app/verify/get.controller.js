const logger = require('../../common/utils/logger');
const CookieModel = require('../../common/models/Cookie.class');
const validateTokenService = require('../../common/services/validate-token');
const verifyUserService = require('../../common/services/verificationApi');

module.exports = (req, res) => {
  logger.debug('In verify / registeruser get controller');

  // Start by clearing cookies and initialising
  const cookie = new CookieModel(req);
  cookie.reset();
  cookie.initialise();

  // Look up and validate token, checking it hasn't expired
  let token = req.query.query;
  const hashedToken = validateTokenService.generateHash(token);

  logger.debug('Calling verify user endpoint');
  verifyUserService.verifyUser(hashedToken)
    .then((response) => {
      // TODO
      // Check response for error message.
      // if found, render error messages
      res.render('app/verify/registeruser/index');
    });
};
