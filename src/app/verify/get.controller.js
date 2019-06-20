const logger = require('../../common/utils/logger')(__filename);
const CookieModel = require('../../common/models/Cookie.class');
const verifyUserService = require('../../common/services/verificationApi');
const sendTokenService = require('../../common/services/send-token');
const tokenservice = require('../../common/services/create-token');
const tokenApi = require('../../common/services/tokenApi');
const nanoid = require('nanoid/generate');

module.exports = async (req, res) => {
  logger.debug('In verify / registeruser get controller');

  // Start by clearing cookies and initialising
  const cookie = new CookieModel(req);
  cookie.reset();
  cookie.initialise();

  try {
    let token = req.query.query;
    const hashedToken = verifyUserService.generateHash(token);
    const apiResponse = await verifyUserService.verifyUser(hashedToken);
    const parsedResponse = JSON.parse(apiResponse);
    let message = 'Your account has now been successfully verified.' +
      'You can now log on and submit GAR files online.';

    if (parsedResponse.message === 'Token has expired') {
      logger.info('Token expired, updating');
      const alphabet = '23456789abcdefghjkmnpqrstuvwxyz-';
      const token = nanoid(alphabet, 13);
      const hashtoken = tokenservice.generateHash(token);
      tokenApi.updateToken(hashtoken, parsedResponse.userId);
      sendTokenService.send(
        parsedResponse.firstName,
        parsedResponse.email,
        token
      );
      message = 'Your token has expired. We have created a new token for you. ' +
        'Please check your email and click the new link';
    }
    if (parsedResponse.message == 'Token is invalid') {
      message = 'This token is invalid, click the link provided in the email or ' +
        'contact support for additional help'
    }
    return res.render('app/verify/registeruser/index', { message });
  } catch (err) {
    logger.error(err);
    return res.render('app/verify/registeruser/index');
  }
};
