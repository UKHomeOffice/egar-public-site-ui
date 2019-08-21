const validator = require('../../common/utils/validator');
const ValidationRule = require('../../common/models/ValidationRule.class');
const { MAX_STRING_LENGTH } = require('../../common/config/index');

module.exports.validations = (req) => {
  const dobObj = { d: req.body.dobDay, m: req.body.dobMonth, y: req.body.dobYear };
  const expiryDateObj = { d: req.body.expiryDay, m: req.body.expiryMonth, y: req.body.expiryYear };
  return [
    [
      new ValidationRule(validator.realDate, 'dob', dobObj, 'Enter a real date of birth'),
    ],
    [
      new ValidationRule(validator.realDate, 'documentExpiryDate', expiryDateObj, 'Enter a real document expiry date'),
    ],
    [
      new ValidationRule(validator.notEmpty, 'firstName', req.body.firstName, 'Enter the given name of the person'),
      new ValidationRule(validator.isValidStringLength, 'firstName', req.body.firstName, `Given name must be ${MAX_STRING_LENGTH} characters or less`),
    ],
    [
      new ValidationRule(validator.notEmpty, 'lastName', req.body.lastName, 'Enter the surname of the person'),
      new ValidationRule(validator.isValidStringLength, 'lastName', req.body.lastName, `Surname must be ${MAX_STRING_LENGTH} characters or less`),
    ],
    [
      new ValidationRule(validator.notEmpty, 'nationality', req.body.nationality, 'Enter the nationality of the person'),
    ],
    [
      new ValidationRule(validator.notEmpty, 'birthplace', req.body.birthplace, 'Enter the place of birth of the person'),
      new ValidationRule(validator.isValidStringLength, 'birthplace', req.body.birthplace, `Place of birth must be ${MAX_STRING_LENGTH} characters or less`),
    ],
    [
      new ValidationRule(validator.notEmpty, 'personType', req.body.personType, 'Select the type of person'),
    ],
    [
      new ValidationRule(validator.notEmpty, 'gender', req.body.gender, 'Select the gender of the person'),
    ],
    [
      new ValidationRule(validator.notEmpty, 'travelDocumentNumber', req.body.travelDocumentNumber, 'Enter the travel document number'),
      new ValidationRule(validator.isValidStringLength, 'travelDocumentNumber', req.body.travelDocumentNumber, `Travel document number must be ${MAX_STRING_LENGTH} characters or less`),
    ],
    [
      new ValidationRule(validator.notEmpty, 'travelDocumentType', req.body.travelDocumentType, 'Select the travel document type'),
    ],
    [
      new ValidationRule(validator.notEmpty, 'issuingState', req.body.issuingState, 'Enter the issuing state for the document'),
    ],
  ];
};
