import validator from '../../../common/utils/validator.js';
import ValidationRule from '../../../common/models/ValidationRule.class.js';
import { MAX_STRING_LENGTH } from '../../../common/config/index.js';
import { MAX_EMAIL_LENGTH } from '../../../common/config/index.js';

export default req => [
  [
    new ValidationRule(validator.notEmpty, 'fname', req.body.fname, 'Please enter the given names of the user'),
    new ValidationRule(validator.isValidStringLength, 'fname', req.body.fname, `Given names must be ${MAX_STRING_LENGTH} characters or less`),
    new ValidationRule(validator.isAlpha, 'fname', req.body.fname, `Given names must not contain special characters, apostrophes or numbers`),

  ],
  [
    new ValidationRule(validator.notEmpty, 'lname', req.body.lname, 'Please enter the surname of the user'),
    new ValidationRule(validator.isValidStringLength, 'lname', req.body.lname, `Surname must be ${MAX_STRING_LENGTH} characters or less`),
    new ValidationRule(validator.isAlpha, 'lname', req.body.lname, `Surname must not contain special characters, apostrophes or numbers`),
  ],
  [
    new ValidationRule(validator.notEmpty, 'email', req.body.email, 'Please enter the email address of the user'),
    new ValidationRule(validator.isValidEmailLength, 'email', req.body.email, `Email must be ${MAX_EMAIL_LENGTH} characters or less`),
    new ValidationRule(validator.email, 'email', req.body.email, `Please enter the valid email`),
  ],
  [
    new ValidationRule(validator.valuetrue, 'cemail', req.body.email === req.body.cemail, 'Please ensure the email addresses match'),
  ],
];
