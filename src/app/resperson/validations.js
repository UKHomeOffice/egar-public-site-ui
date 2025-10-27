const i18n = require('i18n');

const ValidationRule = require('../../common/models/ValidationRule.class');
const validator = require('../../common/utils/validator');
const {
  MAX_STRING_LENGTH,
  MAX_EMAIL_LENGTH,
  MAX_POSTCODE_LENGTH,
} = require('../../common/config/index');

module.exports.validations = (req) => {
  const {
    responsibleGivenName,
    responsibleSurname,
    responsibleContactNo,
    responsibleAddressLine1,
    responsibleEmail,
    responsibleAddressLine2,
    responsibleTown,
    responsibleCountry,
    responsiblePostcode,
    fixedBasedOperator,
    fixedBasedOperatorAnswer,
  } = req.body;

  return [
    [
      new ValidationRule(
        validator.isNotEmpty,
        'responsibleGivenName',
        responsibleGivenName,
        'Enter given names for the responsible person'
      ),
      new ValidationRule(
        validator.isValidStringLength,
        'responsibleGivenName',
        responsibleGivenName,
        `Given names must be ${MAX_STRING_LENGTH} characters or less`
      ),
      new ValidationRule(
        validator.isAlpha,
        'responsibleGivenName',
        responsibleGivenName,
        `Given names must not contain special characters, apostrophes or numbers`
      ),
      new ValidationRule(
        validator.notEmpty,
        'responsibleGivenName',
        responsibleGivenName,
        'Enter given names for the responsible person'
      ),
    ],
    [
      new ValidationRule(
        validator.isNotEmpty,
        'responsibleSurname',
        responsibleSurname,
        'Enter a surname for the responsible person'
      ),
      new ValidationRule(
        validator.isValidStringLength,
        'responsibleSurname',
        responsibleSurname,
        `Surname must be ${MAX_STRING_LENGTH} characters or less`
      ),
      new ValidationRule(
        validator.isAlpha,
        'responsibleSurname',
        responsibleSurname,
        `Surname must not contain special characters, apostrophes or numbers`
      ),
      new ValidationRule(
        validator.notEmpty,
        'responsibleSurname',
        responsibleSurname,
        'Enter a surname for the responsible person'
      ),
    ],
    [
      new ValidationRule(
        validator.validIntlPhone,
        'responsibleContactNo',
        responsibleContactNo,
        i18n.__('validator_contact_number')
      ),
    ],
    [
      new ValidationRule(
        validator.notEmpty,
        'responsibleEmail',
        responsibleEmail,
        'You must enter an email for the responsible person'
      ),
      new ValidationRule(
        validator.email,
        'responsibleEmail',
        responsibleEmail,
        'Please enter a valid email address'
      ),
      new ValidationRule(
        validator.isValidEmailLength,
        'responsibleEmail',
        responsibleEmail,
        `Email must be ${MAX_EMAIL_LENGTH} characters or less`
      ),
    ],
    [
      new ValidationRule(
        validator.notEmpty,
        'responsibleAddressLine1',
        responsibleAddressLine1,
        'Enter address line 1 of the responsible person'
      ),
      new ValidationRule(
        validator.isValidStringLength,
        'responsibleAddressLine1',
        responsibleAddressLine1,
        `Address line 1 must be ${MAX_STRING_LENGTH} characters or less`
      ),
      new ValidationRule(
        validator.isAddressValidCharacters,
        'responsibleAddressLine1',
        responsibleAddressLine1,
        `Address line 1 must not contain special characters such as $ % ' or ä`
      ),
    ],
    [
      new ValidationRule(
        validator.isValidStringLength,
        'responsibleAddressLine2',
        responsibleAddressLine2,
        `Address line 2 must be ${MAX_STRING_LENGTH} characters or less`
      ),
      new ValidationRule(
        validator.isAddressValidCharacters,
        'responsibleAddressLine2',
        responsibleAddressLine2,
        `Address line 2 must not contain special characters such as $ % ' or ä`
      ),
    ],
    [
      new ValidationRule(
        validator.notEmpty,
        'responsibleTown',
        responsibleTown,
        'Enter a town or city for the responsible person'
      ),
      new ValidationRule(
        validator.isValidStringLength,
        'responsibleTown',
        responsibleTown,
        `Town or city must be ${MAX_STRING_LENGTH} characters or less`
      ),
      new ValidationRule(
        validator.isAddressValidCharacters,
        'responsibleTown',
        responsibleTown,
        `Town or city must not contain special characters such as $ % ' or ä`
      ),
    ],
    [
      new ValidationRule(
        validator.notEmpty,
        'responsiblePostcode',
        responsiblePostcode,
        'Enter a postcode for the responsible person.'
      ),
      new ValidationRule(
        validator.validTextLength,
        'responsiblePostcode',
        { value: responsiblePostcode, maxLength: MAX_POSTCODE_LENGTH },
        `Postcode must be ${MAX_POSTCODE_LENGTH} characters or less`
      ),
      new ValidationRule(
        validator.isPostCodeValidCharacters,
        'responsiblePostcode',
        responsiblePostcode,
        `Postcode must not contain special characters such as $ % ' or ä`
      ),
    ],
    [
      new ValidationRule(
        validator.notEmpty,
        'responsibleCountry',
        responsibleCountry,
        'Enter a country for the responsible person'
      ),
    ],
    [
      req.body.fixedBasedOperator !== 'Other'
        ? new ValidationRule(
            validator.notEmpty,
            'fixedBasedOperator',
            fixedBasedOperator,
            `Select the role of the responsible person.`
          )
        : new ValidationRule(
            validator.notEmpty,
            'fixedBasedOperatorAnswer',
            fixedBasedOperatorAnswer,
            `Enter your responsible person role.`
          ),
    ],
  ];
};
