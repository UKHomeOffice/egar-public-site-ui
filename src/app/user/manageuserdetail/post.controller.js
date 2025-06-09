const logger = require('../../../common/utils/logger')(__filename);
const ValidationRule = require('../../../common/models/ValidationRule.class');
const validator = require('../../../common/utils/validator');
const CookieModel = require('../../../common/models/Cookie.class');
const userApi = require('../../../common/services/userManageApi');
const { MAX_STRING_LENGTH } = require('../../../common/config/index');
const {USER_GIVEN_NAME_CHARACTER_COUNT, USER_SURNAME_CHARACTER_COUNT} = require("../../../common/config");

module.exports = (req, res) => {
  const firstName = req.body.firstname;
  const lastName = req.body.lastname;

  delete req.session.successMsg;
  delete req.session.successHeader;

  // Start by clearing cookies and initialising
  const cookie = new CookieModel(req);

  // Define a validation chain for user registeration fields
  const firstNameChain = [
    new ValidationRule(validator.validFirstNameLength, 'firstname', firstName, `Please enter a given name of at most ${USER_GIVEN_NAME_CHARACTER_COUNT} characters`),
    new ValidationRule(validator.notEmpty, 'firstname', firstName, 'Enter your given names'),
    new ValidationRule(validator.nameHasNoNumbers, 'firstname', firstName, 'Your given names cannot include numbers'),
    new ValidationRule(validator.isValidStringLength, 'firstname', firstName, `Given name must be ${MAX_STRING_LENGTH} characters or less`),
    new ValidationRule(validator.validName, 'firstname', firstName, 'Your given names cannot include special characters or numbers'),
  ];
  const lnameChain = [
    new ValidationRule(validator.notEmpty, 'lastname', lastName, 'Enter your family name'),
    new ValidationRule(validator.nameHasNoNumbers, 'lastname', lastName, 'Your family name cannot include numbers'),
    new ValidationRule(validator.isValidStringLength, 'lastname', lastName, `Family name must be ${MAX_STRING_LENGTH} characters or less`),
    new ValidationRule(validator.validName, 'lastname', lastName, 'Your family name cannot include special characters or numbers'),
      new ValidationRule(validator.validSurnameLength, 'lastname', lastName, `Please enter a family name of at most ${USER_SURNAME_CHARACTER_COUNT} characters`),
  ];

  validator.validateChains([firstNameChain, lnameChain])
    .then(() => {

      if (firstName?.trim() === cookie.getUserFirstName() && lastName?.trim() === cookie.getUserLastName()) {
        logger.debug('Names unchanged - skipping update');
        return res.redirect('/user/details');
      }

      userApi.updateDetails(cookie.getUserEmail(), firstName, lastName)
        .then((apiResponse) => {
          const parsedResponse = JSON.parse(apiResponse);
          if (Object.prototype.hasOwnProperty.call(parsedResponse, 'message')) {
            return res.render('app/user/manageuserdetail/index', { cookie, errors: [parsedResponse] });
          }
          cookie.setUserFirstName(firstName);
          cookie.setUserLastName(lastName);
          req.session.successMsg = 'You have changed your name';
          req.session.successHeader = 'Success';
          req.session.save((err) => {
            if (err) {
              logger.error('Failed to save session');
              logger.error(err);
            }
            return res.redirect('/user/details');
          });
        })
        .catch((err) => {
          logger.error('Failed to update user details');
          logger.error(err);
          res.render('app/user/manageuserdetail/index', { cookie, errors: [{ message: 'Failed to update. Try again' }] });
        });
    })
    .catch((err) => {
      logger.error('User manage details validation failed');
      logger.debug(JSON.stringify(err));
      res.render('app/user/manageuserdetail/index', { cookie, errors: err });
    });
};
