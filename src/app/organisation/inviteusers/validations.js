const validator = require('../../../common/utils/validator');
const ValidationRule = require('../../../common/models/ValidationRule.class');

module.exports.validations = (req) => {
  return [
    [
      new ValidationRule(validator.notEmpty, 'fname', req.body.fname, 'Please enter the first name of the user'),
    ],
    [
      new ValidationRule(validator.notEmpty, 'lname', req.body.lname, 'Please enter the last name of the user'),
    ],
    [
      new ValidationRule(validator.notEmpty, 'email', req.body.email, 'Please enter the email address of the user'),
    ],
    [
      new ValidationRule(validator.valuetrue, 'cemail', req.body.email === req.body.cemail, 'Please ensure the email addresses match'),
    ],
  ];
};
