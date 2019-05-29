const ValidationRule = require('../../../common/models/ValidationRule.class');
const validator = require('../../../common/utils/validator');

const validationIds = [
  'first-name',
  'last-name',
  'person-type',
  'birthplace',
  'gender',
  'nationality',
  'issuing-state',
  'travel-document-number',
  'travel-document-type',
];

const validationValues = (req) => {
  return [
    req.body['first-name'],
    req.body['last-name'],
    req.body['person-type'],
    req.body['birthplace'],
    req.body.gender,
    req.body.nationality,
    req.body['issuing-state'],
    req.body['travel-document-number'],
    req.body['travel-document-type'],
  ];
};

const validationMsgs = [
  'Enter a given name',
  'Enter a surname',
  'Enter a person type',
  'Enter a place of birth',
  'Enter a gender',
  'Enter a nationality',
  'Enter an issuing state',
  'Enter a document number',
  'Enter a document type',
];

const birthDateObj = (req) => {
  return { d: req.body.dobDay, m: req.body.dobMonth, y: req.body.dobYear };
};

const docExpiryObj = (req) => {
  return { d: req.body.expiryDay, m: req.body.expiryMonth, y: req.body.expiryYear };
};

const validations = (req) => {
  const manifestValidations = validator.genValidations(validator.notEmpty, validationIds, validationValues(req), validationMsgs);
  const birthDateValidation = [new ValidationRule(validator.realDate, 'dob', birthDateObj(req), 'Enter a real birth date')];
  const docExpiryDateValidation = [new ValidationRule(validator.realDate, 'documentExpiryDate', docExpiryObj(req), 'Enter a real expiry date')];
  manifestValidations.push(birthDateValidation, docExpiryDateValidation);
  return manifestValidations;
};

module.exports.validations = (req) => {
  return validations(req);
};
