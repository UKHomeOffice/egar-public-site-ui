const logger = require('../../../common/utils/logger')(__filename);
const ValidationRule = require('../../../common/models/ValidationRule.class');
const validator = require('../../../common/utils/validator');
const CookieModel = require('../../../common/models/Cookie.class');
const tokenApi = require('../../../common/services/tokenApi');
const token = require('../../../common/services/create-token');
const userApi = require('../../../common/services/userManageApi');
const emailService = require('../../../common/services/sendEmail');
const settings = require('../../../common/config/index');
const config = require('../../../common/config/index');

module.exports = (req, res) => {
  logger.debug('In user / login post controller');

  const usrname = req.body.Username;

  // Start by clearing cookies and initialising
  const cookie = new CookieModel(req);
  cookie.reset();
  cookie.initialise();
  req.session.cookie.expires = false;

  // Define a validation chain for user registeration fields
  const unameChain = [
    new ValidationRule(validator.notEmpty, 'Username', usrname, 'Enter your email'),
  ];

  const errMsg = { message: 'There was a problem sending your code. Please try again' };

  cookie.setUserEmail(usrname);

  // Validate chains
  validator.validateChains([unameChain])
    .then(() => {
      userApi.userSearch(usrname)
        .then((result) => {
          const user = JSON.parse(result);
          if (Object.prototype.hasOwnProperty.call(user, 'message')) {
            logger.info(`Invalid email entered: ${usrname}`);
            cookie.setUserVerified(false);
            if (user.message === 'No results found') {
              emailService
                .send(config.NOTIFY_NOT_REGISTERED_TEMPLATE_ID, usrname, {
                  base_url: config.BASE_URL,
                })
                .then(() => {
                  res.redirect('/login/authenticate');
                })
                .catch((err) => {
                  logger.error('Govnotify failed to send an email');
                  logger.error(err);
                  res.redirect('/login/authenticate');
                });
            }
          } else {
            logger.debug('User found');
            logger.debug(`User state: ${user.state.toLowerCase()}`);
            if (user.state.toLowerCase() !== 'verified') {
              logger.info('User not verified, skipping token send');
              
              // Set variables to be used by resend link on next screen
              cookie.setUserFirstName(user.firstName);
              cookie.setUserDbId(user.userId);

              return res.render('app/user/login/index', { cookie, unverified: true });
            }
            const mfaToken = token.genMfaToken();
            cookie.setUserVerified(true);
            tokenApi.setMfaToken(usrname, mfaToken, true)
              .then(() => {
                emailService.send(settings.NOTIFY_MFA_TEMPLATE_ID, usrname, { mfaToken });
                return res.redirect('/login/authenticate');
              })
              .catch((err) => {
                logger.error(err);
                return res.render('app/user/login/index', { cookie, errors: [errMsg] });
              });
          }
        })
        .catch((err) => {
          logger.error(err);
          res.render('app/user/login/index', { cookie, errors: [errMsg] });
        });
    })
    .catch((err) => {
      logger.error('Validation error when logging in');
      res.render('app/user/login/index', { cookie, errors: err });
    });
};
