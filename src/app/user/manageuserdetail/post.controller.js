const logger = require('../../../common/utils/logger')(__filename);
const ValidationRule = require('../../../common/models/ValidationRule.class');
const validator = require('../../../common/utils/validator');
const CookieModel = require('../../../common/models/Cookie.class');
const userApi = require('../../../common/services/userManageApi');
const { MAX_STRING_LENGTH } = require('../../../common/config/index');

module.exports = (req, res) => {
  const firstName = req.body.Firstname;
  const lastName = req.body.Lastname;

  // Start by clearing cookies and initialising
  const cookie = new CookieModel(req);

  // Define a validation chain for user registeration fields
  const firstNameChain = [
    new ValidationRule(validator.notEmpty, 'firstname', firstName, 'Enter your given name'),
    new ValidationRule(validator.isValidStringLength, 'firstname', firstName, `Given name must be ${MAX_STRING_LENGTH} characters or less`),
  ];
  const lnameChain = [
    new ValidationRule(validator.notEmpty, 'lastname', lastName, 'Enter your surname'),
    new ValidationRule(validator.isValidStringLength, 'lastname', lastName, `Surname must be ${MAX_STRING_LENGTH} characters or less`),
  ];

  validator.validateChains([firstNameChain, lnameChain])
    .then(() => {
      logger.debug('Updating user in the database');
      userApi.updateDetails(cookie.getUserEmail(), firstName, lastName)
        .then((apiResponse) => {
          const parsedResponse = JSON.parse(apiResponse);
          if (Object.prototype.hasOwnProperty.call(parsedResponse, 'message')) {
            return res.render('app/user/manageuserdetail/index', { cookie, errors: [parsedResponse] });
          }
          cookie.setUserFirstName(firstName);
          cookie.setUserLastName(lastName);
          return res.render('app/user/detailschanged/index', { cookie });
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
