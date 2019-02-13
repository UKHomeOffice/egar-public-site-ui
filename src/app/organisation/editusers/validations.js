const validator = require('../../../common/utils/validator');
const ValidationRule = require('../../../common/models/ValidationRule.class');

module.exports.validations = (req) => {
  return [
    [
      new ValidationRule(validator.notEmpty, 'firstName', req.body.firstName, 'Enter a given name'),
    ],
    [
      new ValidationRule(validator.notEmpty, 'lastName', req.body.lastName, 'Enter a last name'),
    ],
    // [
    //   new ValidationRule(validator.notEmpty, 'role', req.body.role, 'Provide a user role'),
    // ],
  ];
};
