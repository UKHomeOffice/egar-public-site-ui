const validator = require('../../../common/utils/validator');
const ValidationRule = require('../../../common/models/ValidationRule.class');
const { MAX_STRING_LENGTH } = require('../../../common/config/index');

module.exports.validations = (req) => {
  return [
    [
      new ValidationRule(validator.notEmpty, 'firstName', req.body.firstName, 'Enter a given name'),
      new ValidationRule(validator.isValidStringLength, 'firstName', req.body.firstName, `Given name must be ${MAX_STRING_LENGTH} characters or less`),
    ],
    [
      new ValidationRule(validator.notEmpty, 'lastName', req.body.lastName, 'Enter a surname'),
      new ValidationRule(validator.isValidStringLength, 'lastname', req.body.lastName, `Surname must be ${MAX_STRING_LENGTH} characters or less`),
    ],
    [
      new ValidationRule(validator.notEmpty, 'role', req.body.role, 'Provide a user role'),
    ],
  ];
};
