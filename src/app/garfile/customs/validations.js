const validator = require('../../../common/utils/validator');
const ValidationRule = require('../../../common/models/ValidationRule.class');

module.exports.validations = (req) => {
  return [
    [
      new ValidationRule(validator.notEmpty, 'prohibitedGoods', req.body.prohibitedGoods, 'Select a value for customs declaration'),
    ],
    [
      new ValidationRule(validator.notEmpty, 'freeCirculation', req.body.freeCirculation, 'Select a free circulation value'),
    ],
    [
      new ValidationRule(validator.notEmpty, 'visitReason', req.body.visitReason, 'Select a reason for visit'),
    ],
  ];
};
