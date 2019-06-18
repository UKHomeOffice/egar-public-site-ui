const validator = require('../../../common/utils/validator');
const ValidationRule = require('../../../common/models/ValidationRule.class');

module.exports.validations = (req) => {
  return [
    [
      new ValidationRule(validator.notEmpty, 'fname', req.body.fname, 'Please enter the given name of the user'),
    ],
    [
      new ValidationRule(validator.notEmpty, 'lname', req.body.lname, 'Please enter the surname of the user'),
      new ValidationRule(validator.isValidStringLength, 'lname', req.body.lname, `Surname exceeded the limit of ${validator.validationSettings.MAX_STRING_LENGTH} characters`)
    ],
    [
      new ValidationRule(validator.notEmpty, 'email', req.body.email, 'Please enter the email address of the user'),
    ],
    [
      new ValidationRule(validator.valuetrue, 'cemail', req.body.email === req.body.cemail, 'Please ensure the email addresses match'),
    ],
  ];
};
