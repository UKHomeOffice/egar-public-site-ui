const validator = require('../../../common/utils/validator');
const ValidationRule = require('../../../common/models/ValidationRule.class');
const { MAX_STRING_LENGTH } = require('../../../common/config/index');

module.exports.validations = (req) => [
  [
    new ValidationRule(validator.notEmpty, 'firstName', req.body.firstName, 'Enter given names'),
    new ValidationRule(
      validator.isValidStringLength,
      'firstName',
      req.body.firstName,
      `Given names must be ${MAX_STRING_LENGTH} characters or less`
    ),
    new ValidationRule(
      validator.isAlpha,
      'firstName',
      req.body.firstName,
      `Given names must not contain special characters, apostrophes or numbers`
    ),
  ],
  [
    new ValidationRule(validator.notEmpty, 'lastName', req.body.lastName, 'Enter a surname'),
    new ValidationRule(
      validator.isValidStringLength,
      'lastName',
      req.body.lastName,
      `Surname must be ${MAX_STRING_LENGTH} characters or less`
    ),
    new ValidationRule(
      validator.isAlpha,
      'lastName',
      req.body.lastName,
      `Surname must not contain special characters, apostrophes or numbers`
    ),
  ],
  [new ValidationRule(validator.notEmpty, 'role', req.body.role, 'Provide a user role')],
];
