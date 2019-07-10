const ValidationRule = require('../../../common/models/ValidationRule.class');
const validator = require('../../../common/utils/validator');
const { MAX_STRING_LENGTH } = require('../../../common/config/index');

module.exports.validations = (req) => {
  const {
    responsibleGivenName,
    responsibleSurname,
    responsibleContactNo,
    responsibleAddressLine1,
    responsibleAddressLine2,
    responsibleTown,
    responsibleCounty,
  } = req.body;

  return [
    [
      new ValidationRule(validator.notEmpty, 'responsibleGivenName', responsibleGivenName, 'Enter a given name for the responsible person'),
      new ValidationRule(validator.isValidStringLength, 'responsibleGivenName', responsibleGivenName, `Given must be ${MAX_STRING_LENGTH} characters or less`),
    ],
    [
      new ValidationRule(validator.notEmpty, 'responsibleSurname', responsibleSurname, 'Enter a surname for the responsible person'),
      new ValidationRule(validator.isValidStringLength, 'responsibleSurname', responsibleSurname, `Surname must be ${MAX_STRING_LENGTH} characters or less`),
    ],
    [
      new ValidationRule(validator.validIntlPhone, 'responsibleContactNo', responsibleContactNo, 'Enter a telephone number with international dialling code with no symbols'),
    ],
    [
      new ValidationRule(validator.notEmpty, 'responsibleAddressLine1', responsibleAddressLine1, 'Enter address line 1 of the responsible person'),
    ],
    [
      new ValidationRule(validator.notEmpty, 'responsibleAddressLine2', responsibleAddressLine2, 'Enter address line 2 of the responsible person'),
    ],
    [
      new ValidationRule(validator.notEmpty, 'responsibleTown', responsibleTown, 'Enter a town or city for the responsible person'),
    ],
    [
      new ValidationRule(validator.notEmpty, 'responsibleCounty', responsibleCounty, 'Enter a county for the responsible person'),
    ],
  ];
};
