/* eslint-disable no-underscore-dangle */

import i18n from 'i18n';

import loggerFactory from '../../../common/utils/logger.js';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const logger = loggerFactory(__filename);
import ValidationRule from '../../../common/models/ValidationRule.class.js';
import validator from '../../../common/utils/validator.js';
import CookieModel from '../../../common/models/Cookie.class.js';
import tokenApi from '../../../common/services/tokenApi.js';
import userApi from '../../../common/services/userManageApi.js';
import settings from '../../../common/config/index.js';

export default (req, res) => {
  logger.debug('In verify / mfa post controller');
  const { mfaCode } = req.body;

  const mfaCodeChain = [
    new ValidationRule(validator.notEmpty, 'mfaCode', mfaCode, 'Enter your code'),
  ];

  const cookie = new CookieModel(req);

  const mfaTokenLength = settings.MFA_TOKEN_LENGTH;
  const errMsg = { identifier: 'mfaCode', message: i18n.__('validator_authentication_error') };

  validator.validateChains([mfaCodeChain])
    .then(() => {
      tokenApi.validateMfaToken(cookie.getUserEmail(), parseInt(mfaCode, 10))
        .then(() => {
          tokenApi.updateMfaToken(cookie.getUserEmail(), parseInt(mfaCode, 10))
            .then(() => {
              userApi.getDetails(cookie.getUserEmail())
                .then((apiResponse) => {
                  const parsedResponse = apiResponse;
                  cookie.setOrganisationId(apiResponse?.organisation?.organisationId);
                  cookie.setLoginInfo(parsedResponse);
                  req.session.save(() => {
                    res.redirect('/home');
                  });
                })
                .catch((err) => {
                  logger.error(err);
                  res.render('app/verify/mfa/index', { cookie, mfaTokenLength, errors: [errMsg] });
                });
            })
            .catch((err) => {
              logger.error(err);
              res.render('app/verify/mfa/index', { cookie, mfaTokenLength, errors: [errMsg] });
            });
        })
        .catch((err) => {
          // Token API error
          logger.error(err);
          res.render('app/verify/mfa/index', { cookie, mfaTokenLength, errors: [errMsg] });
        });
    }).catch((err) => {
      // Page validation error
      logger.info(JSON.stringify(err));
      res.render('app/verify/mfa/index', { cookie, mfaTokenLength, errors: err });
    });
};
