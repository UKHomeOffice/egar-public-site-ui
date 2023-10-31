const validator = require('../../common/utils/validator');
const ValidationRule = require('../../common/models/ValidationRule.class');
const { MAX_STRING_LENGTH } = require('../../common/config/index');

module.exports.validations = (req) => {
  const dobObj = { d: req.body.dobDay, m: req.body.dobMonth, y: req.body.dobYear };
  const expiryDateObj = { d: req.body.expiryDay, m: req.body.expiryMonth, y: req.body.expiryYear };
  const docTypeOther = req.body.travelDocumentType;

  if (docTypeOther === 'Other') {
    return [
      [
        new ValidationRule(validator.bornAfter1900, 'dob', dobObj, 'Enter a real date of birth'),
      ],
      [
        new ValidationRule(validator.realDateInFuture, 'documentExpiryDate', expiryDateObj, 'Enter a real document expiry date'),
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
        new ValidationRule(validator.isValidOptionalStringLength, 'birthplace', req.body.birthplace, `Place of birth must be ${MAX_STRING_LENGTH} characters or less`),
      ],
      [
        new ValidationRule(validator.notEmpty, 'personType', req.body.personType, 'Select the type of person'),
      ],
      [
        new ValidationRule(validator.notEmpty, 'gender', req.body.gender, 'Select the sex of the person'),
      ],
      [
        new ValidationRule(validator.notEmpty, 'travelDocumentNumber', req.body.travelDocumentNumber, 'Enter the travel document number'),
        new ValidationRule(validator.isValidStringLength, 'travelDocumentNumber', req.body.travelDocumentNumber, `Travel document number must be ${MAX_STRING_LENGTH} characters or less`),
        new ValidationRule(validator.isAlphanumeric, 'travelDocumentNumber', req.body.travelDocumentNumber, `Travel document number must be alphanumeric only.`),
      ],
      [
        new ValidationRule(validator.notEmpty, 'travelDocumentType', req.body.travelDocumentType, 'Select the travel document type'),
      ],
      [
        new ValidationRule(validator.notEmpty, 'issuingState', req.body.issuingState, 'Enter the issuing state for the document'),
      ],
      [
        new ValidationRule(validator.notEmpty, 'travelDocumentOther', req.body.travelDocumentOther, 'Enter the document type you are using'),
        new ValidationRule(validator.validName, 'travelDocumentOther', req.body.travelDocumentOther, 'Enter a real document type'),
      ],
    ];
  }
  return [
    [
      new ValidationRule(validator.bornAfter1900, 'dob', dobObj, 'Enter a real date of birth'),
    ],
    [
      new ValidationRule(validator.realDateInFuture, 'documentExpiryDate', expiryDateObj, 'Enter a real document expiry date'),
    ],
    [
      new ValidationRule(validator.notEmpty, 'firstName', req.body.firstName, 'Enter the given name of the person'),
      new ValidationRule(validator.isValidStringLength, 'firstName', req.body.firstName, `Given name must be ${MAX_STRING_LENGTH} characters or less`),
      new ValidationRule(validator.isAlpha, 'firstName', req.body.firstName, `Given name must not contain special characters or numbers`),
    ],
    [
      new ValidationRule(validator.notEmpty, 'lastName', req.body.lastName, 'Enter the surname of the person'),
      new ValidationRule(validator.isValidStringLength, 'lastName', req.body.lastName, `Surname must be ${MAX_STRING_LENGTH} characters or less`),
      new ValidationRule(validator.isAlpha, 'firstName', req.body.firstName, `Surname must not contain special characters or numbers`),
    ],
    [
      new ValidationRule(validator.notEmpty, 'nationality', req.body.nationality, 'Enter the nationality of the person'),
    ],
    [
      new ValidationRule(validator.isValidOptionalStringLength, 'birthplace', req.body.birthplace, `Place of birth must be ${MAX_STRING_LENGTH} characters or less`),
    ],
    [
      new ValidationRule(validator.notEmpty, 'personType', req.body.personType, 'Select the type of person'),
    ],
    [
      new ValidationRule(validator.notEmpty, 'gender', req.body.gender, 'Select the sex of the person'),
    ],
    [
      new ValidationRule(validator.notEmpty, 'travelDocumentNumber', req.body.travelDocumentNumber, 'Enter the travel document number'),
      new ValidationRule(validator.isValidStringLength, 'travelDocumentNumber', req.body.travelDocumentNumber, `Travel document number must be ${MAX_STRING_LENGTH} characters or less`),
      new ValidationRule(validator.isAlphanumeric, 'travelDocumentNumber', req.body.travelDocumentNumber, `Travel document number must be alphanumeric only.`),
    ],
    [
      new ValidationRule(validator.notEmpty, 'travelDocumentType', req.body.travelDocumentType, 'Select the travel document type'),
    ],
    [
      new ValidationRule(validator.notEmpty, 'issuingState', req.body.issuingState, 'Enter the issuing state for the document'),
    ],
  ];
};
