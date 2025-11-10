const logger = require('../../../common/utils/logger')(__filename);
const ValidationRule = require('../../../common/models/ValidationRule.class');
const validator = require('../../../common/utils/validator');
const CookieModel = require('../../../common/models/Cookie.class');
const tokenApi = require('../../../common/services/tokenApi');
const token = require('../../../common/services/create-token');
const userApi = require('../../../common/services/userManageApi');
const emailService = require('../../../common/services/sendEmail');
const settings = require('../../../common/config/index');
const oneLoginUtil = require('../../../common/utils/oneLoginAuth');
const config = require('../../../common/config/index');
const { ONE_LOGIN_SHOW_ONE_LOGIN } = require('../../../common/config');

module.exports = (req, res) => {
  logger.debug('In user / login post controller');

  const usrname = req.body.username;

  // Start by clearing cookies and initialising
  const cookie = new CookieModel(req);
  const redirectUrl = cookie.getRedirectUrl();
  cookie.reset();
  cookie.initialise();
  req.session.cookie.expires = false;
  cookie.setRedirectUrl(redirectUrl);

  // Define a validation chain for user registeration fields
  const unameChain = [new ValidationRule(validator.notEmpty, 'username', usrname, 'Enter your email')];

  const errMsg = { message: 'There was a problem sending your code. Please try again.' };

  cookie.setUserEmail(usrname);

  let oneLoginAuthUrl = null;

  if (config.ONE_LOGIN_SHOW_ONE_LOGIN === true) {
    oneLoginAuthUrl = oneLoginUtil.getOneLoginAuthUrl(req, res);
  }

  // Validate chains
  validator
    .validateChains([unameChain])
    .then(() => {
      userApi
        .userSearch(usrname)
        .then((result) => {
          const user = typeof result === 'string' ? JSON.parse(result) : result;

          if (user?.message) {
            logger.info(`Invalid email entered: ${usrname}`);
            cookie.setUserVerified(false);
            if (user.message !== 'No results found') {
              throw new Error(`Unexpected response from API: ${user.message}`);
            }

            let template = 'index';

            if (ONE_LOGIN_SHOW_ONE_LOGIN === true) {
              template = 'email_not_found';
            }

            // Used to send an email and then go to the MFA token verification
            // if it displays an error message, then an email is redundant?
            res.render(`app/user/login/${template}`, {
              cookie,
              unregistered: true,
              oneLoginAuthUrl,
            });
            return;
          }
          const returnedEmail = user.email;
          cookie.setUserEmail(returnedEmail);
          logger.debug('User found');
          logger.debug(`User state: ${user.state.toLowerCase()}`);
          if (user.state.toLowerCase() !== 'verified') {
            logger.info('User not verified, skipping token send');

            // Set variables to be used by resend link on next screen
            cookie.setUserFirstName(user.firstName);
            cookie.setUserDbId(user.userId);

            res.render('app/user/login/index', { cookie, unverified: true });
            return;
          }
          const mfaToken = token.genMfaToken();
          cookie.setUserVerified(true);
          tokenApi
            .setMfaToken(user.email, mfaToken, true)
            .then(() => {
              emailService.send(settings.NOTIFY_MFA_TEMPLATE_ID, usrname, { mfaToken });
              res.redirect('/login/authenticate');
            })
            .catch((err) => {
              logger.error(err);
              res.render('app/user/login/index', { cookie, errors: [errMsg], oneLoginAuthUrl });
            });
        })
        .catch((err) => {
          logger.error(err);
          res.render('app/user/login/index', { cookie, errors: [errMsg], oneLoginAuthUrl });
        });
    })
    .catch((err) => {
      logger.info('Validation error when logging in');
      res.render('app/user/login/index', {
        cookie,
        errors: err,
        ONE_LOGIN_SHOW_ONE_LOGIN: config.ONE_LOGIN_SHOW_ONE_LOGIN,
        oneLoginAuthUrl,
      });
    });
};
