const logger = require('../../../common/utils/logger')(__filename);
const ValidationRule = require('../../../common/models/ValidationRule.class');
const validator = require('../../../common/utils/validator');
const CookieModel = require('../../../common/models/Cookie.class');
const tokenApi = require('../../../common/services/tokenApi');
const token = require('../../../common/services/create-token');
const userApi = require('../../../common/services/userManageApi');
const emailService = require('../../../common/services/sendEmail');
const settings = require('../../../common/config/index');

module.exports = (req, res) => {
  logger.debug('In user / login post controller');

  const usrname = req.body.username;

  // Start by clearing cookies and initialising
  const cookie = new CookieModel(req);
  cookie.reset();
  cookie.initialise();
  req.session.cookie.expires = false;

  // Define a validation chain for user registeration fields
  const unameChain = [
    new ValidationRule(validator.notEmpty, 'username', usrname, 'Enter your email'),
  ];

  const errMsg = { message: 'There was a problem sending your code. Please try again.' };

  cookie.setUserEmail(usrname);

  // Validate chains
  validator.validateChains([unameChain])
    .then(() => {
      userApi.userSearch(usrname).then((result) => {
        const user = typeof result === 'string' ? JSON.parse(result) : result;

        if (user?.message) {
          logger.info(`Invalid email entered: ${usrname}`);
          cookie.setUserVerified(false);
          if (user.message !== 'No results found') {
            throw new Error(`Unexpected response from API: ${user.message}`);
          }

          // Used to send an email and then go to the MFA token verification
          // if it displays an error message, then an email is redundant?
          res.render('app/user/login/index', { cookie, unregistered: true });
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
        tokenApi.setMfaToken(user.email, mfaToken, true)
          .then(() => {
            emailService.send(settings.NOTIFY_MFA_TEMPLATE_ID, usrname, { mfaToken });
            res.redirect('/login/authenticate');
          })
          .catch((err) => {
            logger.error(err);
            res.render('app/user/login/index', { cookie, errors: [errMsg] });
          });
      }).catch((err) => {
        logger.error(err);
        res.render('app/user/login/index', { cookie, errors: [errMsg] });
      });
    })
    .catch((err) => {
      logger.info('Validation error when logging in');
      res.render('app/user/login/index', { cookie, errors: err });
    });
};
