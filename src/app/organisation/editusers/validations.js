const validator = require('../../../common/utils/validator');
const ValidationRule = require('../../../common/models/ValidationRule.class');

module.exports.validations = (req) => {
  return [
    [
      new ValidationRule(validator.notEmpty, 'firstName', req.body.firstName, 'Enter a given name'),
    ],
    [
      new ValidationRule(validator.notEmpty, 'lastName', req.body.lastName, 'Enter a surname'),
      new ValidationRule(validator.isValidStringLength, 'lastname', req.body.lastName, `Surname exceeded the limit of ${validator.validationSettings.MAX_STRING_LENGTH} characters`)
    ],
    [
      new ValidationRule(validator.notEmpty, 'role', req.body.role, 'Provide a user role'),
    ],
  ];
};
