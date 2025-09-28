import loggerFactory from '../../../common/utils/logger.js';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const logger = loggerFactory(__filename);
import CookieModel from '../../../common/models/Cookie.class.js';
import tokenService from '../../../common/services/create-token.js';
import verifyUserService from '../../../common/services/verificationApi.js';

export default (req, res) => {
  logger.debug('In verify / registeruser get controller');

  // Start by clearing cookies and initialising
  const cookie = new CookieModel(req);
  cookie.reset();
  cookie.initialise();

  // Look up and validate token, checking it hasn't expired
  const { token } = req.query;
  const hashedToken = tokenService.generateHash(token);

  logger.debug('Calling verify user endpoint');
  verifyUserService.verifyUser(hashedToken)
    .then((response) => {
      logger.debug(response);
      res.render('app/verify/registeruser/index', { cookie });
    })
    .catch((err) => {
      logger.debug('Failed to verify token');
      logger.error(err);
      res.render('app/verify/registeruser/index', { cookie, message: 'There was an issue verifying your account. Please try again later.' });
    });
};
