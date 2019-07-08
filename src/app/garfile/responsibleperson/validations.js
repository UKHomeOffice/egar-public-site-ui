const ValidationRule = require('../../../common/models/ValidationRule.class');
const validator = require('../../../common/utils/validator');
const { MAX_STRING_LENGTH } = require('../../../common/config/index');

module.exports.validations = (req) => {
  return [
    [
      new ValidationRule(validator.notEmpty, 'responsibleGivenName', req.body.responsibleGivenName, 'Enter a given name for the responsible person'),
      new ValidationRule(validator.isValidStringLength, 'responsibleGivenName', req.budy.responsibleGivenName, `Given must be ${MAX_STRING_LENGTH} characters or less`),
    ],
    [
      new ValidationRule(validator.notEmpty, 'responsibleSurname', req.body.responsibleSurname, 'Enter a surname for the responsible person'),
      new ValidationRule(validator.isValidStringLength, 'responsibleSurname', req.body.responsibleSurname, `Surname must be ${MAX_STRING_LENGTH} characters or less`),
    ],
    [
      new ValidationRule(validator.validIntlPhone, 'responsibleContactNo', req.body.responsibleContactNo, 'Enter a telephone number with international dialling code with no symbols'),
    ],
    [
      new ValidationRule(validator.notEmpty, 'responsibleAddressLine1', req.body.responsibleAddressLine1, 'Enter address line 1 of the responsible person'),
    ],
    [
      new ValidationRule(validator.notEmpty, 'responsibleAddressLine2', req.body.responsibleAddressLine2, 'Enter address line 2 of the responsible person'),
    ],
    [
      new ValidationRule(validator.notEmpty, 'responsibleTown', req.body.responsibleTown, 'Enter a town or city for the responsible person'),
    ],
    [
      new ValidationRule(validator.notEmpty, 'responsibleCounty', req.body.responsibleCounty, 'Enter a county for the responsible person'),
    ],
  ];
};
