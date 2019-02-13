const ValidationRule = require('../../../common/models/ValidationRule.class');
const validator = require('../../../common/utils/validator');

const validationIds = [
  'first_name',
  'surname',
  'persontype',
  'placeOfBirth',
  'nationality',
  'issuingState',
  'documentNumber',
  'documenttype',
];

const validationValues = (req) => {
  return [
    req.body.first_name,
    req.body.surname,
    req.body.persontype,
    req.body.placeOfBirth,
    req.body.nationality,
    req.body.issuingState,
    req.body.documentNumber,
    req.body.documenttype,
  ];
};

const validationMsgs = [
  'Enter a given name',
  'Enter a surname',
  'Enter a person type',
  'Enter a place of birth',
  'Enter a nationality',
  'Enter an issuing state',
  'Enter a document number',
  'Enter a document type',
];

const birthDateObj = (req) => {
  return { d: req.body.dobday, m: req.body.dobmonth, y: req.body.dobyear };
};

const docExpiryObj = (req) => {
  return { d: req.body.expday, m: req.body.expmonth, y: req.body.expyear };
};

const validations = (req) => {
  const manifestValidations = validator.genValidations(validator.notEmpty, validationIds, validationValues(req), validationMsgs);
  const birthDateValidation = [new ValidationRule(validator.realDate, 'dob', birthDateObj(req), 'Enter a real birth date')];
  const docExpiryDateValidation = [new ValidationRule(validator.realDate, 'docExpiry', docExpiryObj(req), 'Enter a real expiry date')];
  manifestValidations.push(birthDateValidation, docExpiryDateValidation);
  return manifestValidations;
};

module.exports.validations = (req) => {
  return validations(req);
};
