import loggerFactory from '../../../common/utils/logger.js';
const logger = loggerFactory(import.meta.url);
import ValidationRule from '../../../common/models/ValidationRule.class.js';
import validator from '../../../common/utils/validator.js';
import CookieModel from '../../../common/models/Cookie.class.js';
import tokenApi from '../../../common/services/tokenApi.js';
import token from '../../../common/services/create-token.js';
import userApi from '../../../common/services/userManageApi.js';
import emailService from '../../../common/services/sendEmail.js';
import settings from '../../../common/config/index.js';
import oneLoginUtil from '../../../common/utils/oneLoginAuth.js';
import config from '../../../common/config/index.js';
import { ONE_LOGIN_SHOW_ONE_LOGIN } from '../../../common/config/index.js';

export default (req, res) => {
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

  let oneLoginAuthUrl = null;

  if (config.ONE_LOGIN_SHOW_ONE_LOGIN === true) {
    oneLoginAuthUrl = oneLoginUtil.getOneLoginAuthUrl(req, res);
  }

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

          let template = 'index';

          if (ONE_LOGIN_SHOW_ONE_LOGIN === true) {
            template = 'email_not_found';
          }

          // Used to send an email and then go to the MFA token verification
          // if it displays an error message, then an email is redundant?
          res.render(`app/user/login/${template}`, { cookie, unregistered: true, oneLoginAuthUrl });
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
            res.render('app/user/login/index', { cookie, errors: [errMsg], oneLoginAuthUrl });
          });
      }).catch((err) => {
        logger.error(err);
        res.render('app/user/login/index', { cookie, errors: [errMsg], oneLoginAuthUrl });
      });
    })
    .catch((err) => {
      logger.info('Validation error when logging in');
      res.render('app/user/login/index', { cookie, errors: err, ONE_LOGIN_SHOW_ONE_LOGIN: config.ONE_LOGIN_SHOW_ONE_LOGIN, oneLoginAuthUrl });
    });
};
