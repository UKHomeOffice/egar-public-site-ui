/* eslint-disable no-underscore-dangle */

import utils from '../../common/utils/utils.js';

import i18n from 'i18n';
import loggerFactory from '../../common/utils/logger.js';
const logger = loggerFactory(import.meta.url);
import CookieModel from '../../common/models/Cookie.class.js';
import verifyUserService from '../../common/services/verificationApi.js';
import sendTokenService from '../../common/services/send-token.js';
import tokenService from '../../common/services/create-token.js';
import tokenApi from '../../common/services/tokenApi.js';

export default async (req, res) => {
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
      const alphabetToken = utils.nanoid(alphabet, 13);
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
