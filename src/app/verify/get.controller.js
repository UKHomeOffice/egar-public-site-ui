/* eslint-disable no-underscore-dangle */

const nanoid = require('nanoid/generate');
const i18n = require('i18n');
const logger = require('../../common/utils/logger')(__filename);
const CookieModel = require('../../common/models/Cookie.class');
const verifyUserService = require('../../common/services/verificationApi');
const sendTokenService = require('../../common/services/send-token');
const tokenService = require('../../common/services/create-token');
const tokenApi = require('../../common/services/tokenApi');

module.exports = async (req, res) => {
  logger.debug('In verify / registeruser get controller');

  // Start by clearing cookies and initialising
  const cookie = new CookieModel(req);
  cookie.reset();
  cookie.initialise();

  var token;
  try {
    token = req.query.query;
    const hashedToken = tokenService.generateHash(token);
    const apiResponse = await verifyUserService.verifyUser(hashedToken);
    const parsedResponse = JSON.parse(apiResponse);
    let message = i18n.__('verify_user_account_success');

    if (parsedResponse.message === 'Token has expired') {
      logger.info('Token expired, updating');
      const alphabet = '23456789abcdefghjkmnpqrstuvwxyz-';
      const alphabetToken = nanoid(alphabet, 13);
      const hashtoken = tokenService.generateHash(alphabetToken);
      // TODO: A Promise.all should wrap these two asynchronous calls to ensure
      // both the new token and email are sent otherwise users will not know if
      // an issue has arisen
      tokenApi.updateToken(hashtoken, parsedResponse.userId);
      sendTokenService.send(
        parsedResponse.firstName,
        parsedResponse.email,
        alphabetToken,
      );
      message = i18n.__('verify_user_account_token_expired');
    }

    if (parsedResponse.message === 'Token is invalid') {
      message = i18n.__('verify_user_account_token_invalid');
    }

    return res.render('app/verify/registeruser/index', { message });

  } catch (err) {
    logger.error('Error during user verification');
    if(token == null) {
      message = i18n.__('verify_user_account_token_not_provided');
      logger.info(message);
      return res.render('app/verify/registeruser/index', { message });
    } else {
      logger.error(err);
    }

    return res.render('app/verify/registeruser/index');
  }
};
