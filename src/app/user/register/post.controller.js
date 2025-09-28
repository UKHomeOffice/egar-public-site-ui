import utils from '../../../common/utils/utils.js';
import loggerFactory from '../../../common/utils/logger.js';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const logger = loggerFactory(__filename);
import ValidationRule from '../../../common/models/ValidationRule.class.js';
import validator from '../../../common/utils/validator.js';
import CookieModel from '../../../common/models/Cookie.class.js';
import tokenservice from '../../../common/services/create-token.js';
import sendTokenService from '../../../common/services/send-token.js';
import userCreateApi from '../../../common/services/createUserApi.js';
import tokenApi from '../../../common/services/tokenApi.js';
import whitelist from '../../../common/services/whiteList.js';
import config from '../../../common/config/index.js';
import { USER_FIRST_NAME_CHARACTER_COUNT, USER_SURNAME_CHARACTER_COUNT } from '../../../common/config/index.js';

const regFailureError = {
  message: 'Registration failed, try again',
};
const userAlreadyRegisteredMsg = 'User already registered';

// Define a validation chain for user registration fields
const createValidationChains = (fname, lname, usrname, cusrname) => {
  const fnameChain = [
    new ValidationRule(validator.notEmpty, 'userFname', fname, 'Please enter your given names'),
    new ValidationRule(validator.validName, 'userFname', fname, 'Please enter valid given names'),
    new ValidationRule(validator.validFirstNameLength, 'userFname', fname, `Please enter given names of at most ${USER_FIRST_NAME_CHARACTER_COUNT} characters`),
  ];
  const lnameChain = [
    new ValidationRule(validator.notEmpty, 'userLname', lname, 'Please enter your surname'),
    new ValidationRule(validator.validName, 'userLname', lname, 'Please enter a valid surname'),
    new ValidationRule(validator.validSurnameLength, 'userLname', lname, `Please enter a surname of at most ${USER_SURNAME_CHARACTER_COUNT} characters`),
  ];
  const userChain = [
    new ValidationRule(validator.notEmpty, 'userId', usrname, 'Please enter your email'),
    new ValidationRule(validator.email, 'userId', usrname, 'Please enter a valid email address'),
    new ValidationRule(validator.valuetrue, 'userId', usrname === cusrname, 'Please ensure the email addresses match'),
  ];
  const confirmuserChain = [
    new ValidationRule(validator.notEmpty, 'cUserId', cusrname, 'Please confirm the email address'),
    new ValidationRule(validator.valuetrue, 'cUserId', usrname === cusrname, 'Please ensure the email addresses match'),
  ];

  return [userChain, confirmuserChain, fnameChain, lnameChain];
};

const createUser = (req, res, cookie) => {
  logger.info('Creating the user in the db');
  // Get form values
  const usrname = req.body.userId;
  const fname = req.body.userFname;
  const lname = req.body.userLname;

  // Generate a token for the user
  const alphabet = '23456789abcdefghjkmnpqrstuvwxyz-';
  const token = utils.nanoid(alphabet, 13);
  const hashtoken = tokenservice.generateHash(token);

  userCreateApi.post(fname, lname, usrname, cookie.getInviteUserToken())
    .then((dbUser) => {
      if (Object.prototype.hasOwnProperty.call(JSON.parse(dbUser), 'message')) {
        logger.info('Failed to register user in db');
        const errMessage = `${JSON.parse(dbUser).message}`;
        logger.info(errMessage);
        cookie.setUserEmail(null);
        if (userAlreadyRegisteredMsg === errMessage) {
          res.render('app/user/register/index', { cookie, errors: [{ message: errMessage }] });
        } else {
          req.session.save(() => { res.redirect('/user/regmsg'); });
        }
        return;
      }
      const { userId } = JSON.parse(dbUser);
      logger.info('Calling gov notify service');

      sendTokenService.send(fname, usrname, token)
        .then(() => {
          logger.info('Storing token in db');
          tokenApi.setToken(hashtoken, userId);
          res.redirect('/user/regmsg');
        })
        .catch((err) => {
          logger.error(`Failed to send notify email for ${usrname}`);
          logger.error(err);
          res.render('app/user/register/index', { cookie, errors: [regFailureError] });
        });
    })
    .catch((err) => {
      logger.error(`Failed to create ${usrname} in DB`);
      logger.error(err);
      res.render('app/user/register/index', { cookie, errors: [regFailureError] });
    });
};

export default (req, res) => {
  logger.debug('In user / register post controller');

  const cookie = new CookieModel(req);

  // Get form values
  const usrname = req.body.userId;
  const cusrname = req.body.cUserId;
  const fname = req.body.userFname;
  const lname = req.body.userLname;

  const validationChains = createValidationChains(fname, lname, usrname, cusrname);

  const isWhitelistRequired = (config.WHITELIST_REQUIRED.toLowerCase() === 'true');

  logger.info('Validating registration input');
  validator.validateChains(validationChains)
    .then(() => {
      // Update the cookie
      cookie.setUserFirstName(fname);
      cookie.setUserLastName(lname);
      cookie.setUserEmail(usrname);

      if (isWhitelistRequired) {
        logger.info('Starting whitelist check');
        whitelist.isWhitelisted(usrname)
          .then((result) => {
            if (result) {
              createUser(req, res, cookie);
              return;
            }
            // Not whitelisted
            cookie.setUserEmail(null);
            req.session.save(() => { res.redirect('/user/regmsg'); });
          })
          .catch((err) => {
            logger.error('Failed to check against whitelist');
            logger.error(err);
            res.render('app/user/register/index', {
              cookie,
              errors: [regFailureError],
            });
          });
      } else {
        createUser(req, res, cookie);
      }
    })
    .catch((err) => {
      logger.info('Failed registration validations');
      logger.error(err)
      res.render('app/user/register/index', {
        cookie,
        fname,
        lname,
        usrname,
        errors: err,
      });
    });
};
