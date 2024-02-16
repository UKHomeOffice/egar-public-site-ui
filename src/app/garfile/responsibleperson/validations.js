/* eslint-disable no-underscore-dangle */

const i18n = require('i18n');

const ValidationRule = require('../../../common/models/ValidationRule.class');
const validator = require('../../../common/utils/validator');
const { MAX_STRING_LENGTH, MAX_EMAIL_LENGTH, MAX_POSTCODE_LENGTH } = require('../../../common/config/index');

module.exports.validations = (req) => {
  const {
    responsibleGivenName,
    responsibleSurname,
    responsibleContactNo,
    responsibleAddressLine1,
    responsibleEmail,
    responsibleAddressLine2,
    responsibleTown,
    responsibleCounty,
    responsiblePostcode
  } = req.body;

  const optionalEmailRule = responsibleEmail ? [
    new ValidationRule(
      validator.email, 'responsibleEmail', responsibleEmail, 'Please enter a valid email address'
    ),
    new ValidationRule(
      validator.isValidEmailLength, 'responsibleEmail', responsibleEmail, `Email must be ${MAX_EMAIL_LENGTH} characters or less`
    ),
  ] : [];

  return [
    [
      new ValidationRule(validator.notEmpty, 'responsibleGivenName', responsibleGivenName, 'Enter a given name for the responsible person'),
      new ValidationRule(validator.isValidStringLength, 'responsibleGivenName', responsibleGivenName, `Given name must be ${MAX_STRING_LENGTH} characters or less`),
      new ValidationRule(validator.isAlpha, 'responsibleGivenName', responsibleGivenName, `Given name must not contain special characters, apostrophes or numbers`),
    ],
    [
      new ValidationRule(validator.notEmpty, 'responsibleSurname', responsibleSurname, 'Enter a surname for the responsible person'),
      new ValidationRule(validator.isValidStringLength, 'responsibleSurname', responsibleSurname, `Surname must be ${MAX_STRING_LENGTH} characters or less`),
      new ValidationRule(validator.isAlpha, 'responsibleSurname', responsibleSurname, `Surname must not contain special characters, apostrophes or numbers`),
    ],
    [
      new ValidationRule(validator.validIntlPhone, 'responsibleContactNo', responsibleContactNo, i18n.__('validator_contact_number')),
    ],
    optionalEmailRule,
    [
      new ValidationRule(validator.notEmpty, 'responsibleAddressLine1', responsibleAddressLine1, 'Enter address line 1 of the responsible person'),
      new ValidationRule(validator.isValidStringLength, 'responsibleAddressLine1', responsibleAddressLine1, `Address line 1 must be ${MAX_STRING_LENGTH} characters or less`),
      new ValidationRule(validator.isAddressValidCharacters, 'responsibleAddressLine1', responsibleAddressLine1, `Address line 1 must not contain special characters such as $ % ' or ä`),
    ],
    [
      new ValidationRule(validator.isValidStringLength, 'responsibleAddressLine2', responsibleAddressLine2, `Address line 2 must be ${MAX_STRING_LENGTH} characters or less`),
      new ValidationRule(validator.isAddressValidCharacters, 'responsibleAddressLine2', responsibleAddressLine2, `Address line 2 must not contain special characters such as $ % ' or ä`),
    ],
    [
      new ValidationRule(validator.notEmpty, 'responsibleTown', responsibleTown, 'Enter a town or city for the responsible person'),
      new ValidationRule(validator.isValidStringLength, 'responsibleTown', responsibleTown, `Town or city must be ${MAX_STRING_LENGTH} characters or less`),
      new ValidationRule(validator.isAddressValidCharacters, 'responsibleTown', responsibleTown, `Town or city must not contain special characters such as $ % ' or ä`),
    ],
    [
      new ValidationRule(validator.validTextLength, 'responsiblePostcode', { value: responsiblePostcode, maxLength: MAX_POSTCODE_LENGTH }, `Postcode must be ${MAX_POSTCODE_LENGTH} characters or less`),
      new ValidationRule(validator.isPostCodeValidCharacters, 'responsiblePostcode', responsiblePostcode, `Postcode must not contain special characters such as $ % ' or ä`),
    ],
    [
      new ValidationRule(validator.notEmpty, 'responsibleCounty', responsibleCounty, 'Enter a country for the responsible person'),
    ],
  ];
};
