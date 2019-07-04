const logger = require('../../common/utils/logger')(__filename);
const CookieModel = require('../../common/models/Cookie.class');
const verifyUserService = require('../../common/services/verificationApi');
const sendTokenService = require('../../common/services/send-token');
const tokenService = require('../../common/services/create-token');
const tokenApi = require('../../common/services/tokenApi');
const nanoid = require('nanoid/generate');
const i18n = require('i18n');

module.exports = async (req, res) => {
  logger.debug('In verify / registeruser get controller');

  // Start by clearing cookies and initialising
  const cookie = new CookieModel(req);
  cookie.reset();
  cookie.initialise();

  try {
    const token = req.query.query;
    const hashedToken = tokenService.generateHash(token);
    const apiResponse = await verifyUserService.verifyUser(hashedToken);
    const parsedResponse = JSON.parse(apiResponse);
    let message = i18n.__('verify_user_account_success');

    if (parsedResponse.message === 'Token has expired') {
      logger.info('Token expired, updating');
      const alphabet = '23456789abcdefghjkmnpqrstuvwxyz-';
      const token = nanoid(alphabet, 13);
      const hashtoken = tokenService.generateHash(token);
      tokenApi.updateToken(hashtoken, parsedResponse.userId);
      sendTokenService.send(
        parsedResponse.firstName,
        parsedResponse.email,
        token
      );
      message = i18n.__('verify_user_account_token_expired');
    }
    if (parsedResponse.message === 'Token is invalid') {
      message = i18n.__('verify_user_account_token_invalid');
    }
    return res.render('app/verify/registeruser/index', { message });
  } catch (err) {
    logger.error(err);
    return res.render('app/verify/registeruser/index');
  }
};
