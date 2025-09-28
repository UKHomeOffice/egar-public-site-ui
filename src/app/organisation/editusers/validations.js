import validator from '../../../common/utils/validator.js';
import ValidationRule from '../../../common/models/ValidationRule.class.js';
import { MAX_STRING_LENGTH } from '../../../common/config/index.js';

export default req => [
  [
    new ValidationRule(validator.notEmpty, 'firstName', req.body.firstName, 'Enter given names'),
    new ValidationRule(validator.isValidStringLength, 'firstName', req.body.firstName, `Given names must be ${MAX_STRING_LENGTH} characters or less`),
    new ValidationRule(validator.isAlpha, 'firstName', req.body.firstName, `Given names must not contain special characters, apostrophes or numbers`),
  ],
  [
    new ValidationRule(validator.notEmpty, 'lastName', req.body.lastName, 'Enter a surname'),
    new ValidationRule(validator.isValidStringLength, 'lastName', req.body.lastName, `Surname must be ${MAX_STRING_LENGTH} characters or less`),
    new ValidationRule(validator.isAlpha, 'lastName', req.body.lastName, `Surname must not contain special characters, apostrophes or numbers`),

  ],
  [
    new ValidationRule(validator.notEmpty, 'role', req.body.role, 'Provide a user role'),
  ],
];
