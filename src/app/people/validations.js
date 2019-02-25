const validator = require('../../common/utils/validator');
const ValidationRule = require('../../common/models/ValidationRule.class');

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
      new ValidationRule(validator.notEmpty, 'first-name', req.body['first-name'], 'Enter the first name of the person'),
    ],
    [
      new ValidationRule(validator.notEmpty, 'last-name', req.body['last-name'], 'Enter the last name of the person'),
    ],
    [
      new ValidationRule(validator.notEmpty, 'nationality', req.body.nationality, 'Enter the nationality of the person'),
    ],
    [
      new ValidationRule(validator.notEmpty, 'birthplace', req.body.birthplace, 'Enter the place of birth of the person'),
    ],
    [
      new ValidationRule(validator.notEmpty, 'person-type', req.body['person-type'], 'Select the type of person'),
    ],
    [
      new ValidationRule(validator.notEmpty, 'gender', req.body.gender, 'Select the gender of the person'),
    ],
    [
      new ValidationRule(validator.notEmpty, 'travel-document-number', req.body['travel-document-number'], 'Enter the travel document number'),
    ],
    [
      new ValidationRule(validator.notEmpty, 'travel-document-type', req.body['travel-document-type'], 'Select the travel document type'),
    ],
    [
      new ValidationRule(validator.notEmpty, 'issuing-state', req.body['issuing-state'], 'Enter the issuing state for the document'),
    ],
  ];
};
