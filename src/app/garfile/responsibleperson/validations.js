/* eslint-disable no-underscore-dangle */

const i18n = require('i18n');

const ValidationRule = require('../../../common/models/ValidationRule.class');
const validator = require('../../../common/utils/validator');
const { MAX_STRING_LENGTH } = require('../../../common/config/index');

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
  } = req.body;

  return [
    [
      new ValidationRule(validator.notEmpty, 'responsibleGivenName', responsibleGivenName, 'Enter a given name for the responsible person'),
      new ValidationRule(validator.isValidStringLength, 'responsibleGivenName', responsibleGivenName, `Given name must be ${MAX_STRING_LENGTH} characters or less`),
    ],
    [
      new ValidationRule(validator.notEmpty, 'responsibleSurname', responsibleSurname, 'Enter a surname for the responsible person'),
      new ValidationRule(validator.isValidStringLength, 'responsibleSurname', responsibleSurname, `Surname must be ${MAX_STRING_LENGTH} characters or less`),
    ],
    [
      new ValidationRule(validator.validIntlPhone, 'responsibleContactNo', responsibleContactNo, i18n.__('validator_contact_number')),
    ],
    [new ValidationRule(validator.email, 'responsibleEmail', responsibleEmail, 'Please enter a valid email address')],
    [
      new ValidationRule(validator.notEmpty, 'responsibleAddressLine1', responsibleAddressLine1, 'Enter address line 1 of the responsible person'),
    ],
    [
      new ValidationRule(validator.notEmpty, 'responsibleTown', responsibleTown, 'Enter a town or city for the responsible person'),
    ],
    [
      new ValidationRule(validator.notEmpty, 'responsibleCounty', responsibleCounty, 'Enter a country for the responsible person'),
    ],
  ];
};
