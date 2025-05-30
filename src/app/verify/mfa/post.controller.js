/* eslint-disable no-underscore-dangle */

const i18n = require('i18n');

const logger = require('../../../common/utils/logger')(__filename);
const ValidationRule = require('../../../common/models/ValidationRule.class');
const validator = require('../../../common/utils/validator');
const CookieModel = require('../../../common/models/Cookie.class');
const tokenApi = require('../../../common/services/tokenApi');
const userApi = require('../../../common/services/userManageApi');
const settings = require('../../../common/config/index');

module.exports = (req, res) => {
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
