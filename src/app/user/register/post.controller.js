const { nanoid } = require('../../../common/utils/utils');

const logger = require('../../../common/utils/logger')(__filename);
const ValidationRule = require('../../../common/models/ValidationRule.class');
const validator = require('../../../common/utils/validator');
const CookieModel = require('../../../common/models/Cookie.class');
const tokenservice = require('../../../common/services/create-token');
const sendTokenService = require('../../../common/services/send-token');
const userCreateApi = require('../../../common/services/createUserApi');
const tokenApi = require('../../../common/services/tokenApi');
const whitelist = require('../../../common/services/whiteList');
const config = require('../../../common/config');
const { USER_FIRST_NAME_CHARACTER_COUNT, USER_SURNAME_CHARACTER_COUNT } = require('../../../common/config/index');

const regFailureError = {
  message: 'Registration failed, try again',
};
const userAlreadyRegisteredMsg = 'User already registered';

// Define a validation chain for user registration fields
const createValidationChains = (fname, lname, usrname, cusrname) => {
  const fnameChain = [
    new ValidationRule(validator.notEmpty, 'userFname', fname, 'Please enter your given name'),
    new ValidationRule(validator.validName, 'userFname', fname, 'Please enter a valid first name'),
    new ValidationRule(validator.validFirstNameLength, 'userFname', fname, `Please enter a first name of at most ${USER_FIRST_NAME_CHARACTER_COUNT} characters`),
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
  const token = nanoid(alphabet, 13);
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

module.exports = (req, res) => {
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
