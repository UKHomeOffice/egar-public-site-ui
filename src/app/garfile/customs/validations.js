const validator = require('../../../common/utils/validator');
const ValidationRule = require('../../../common/models/ValidationRule.class');
const { MAX_TEXT_BOX_LENGTH } = require('../../../common/config/index');

module.exports.validations = (req) => {
  return [
    [
      new ValidationRule(validator.notEmpty, 'prohibitedGoods', req.body.prohibitedGoods, 'Select a value for customs declaration'),
    ],
    [
      new ValidationRule(validator.isValidTextBoxLength, 'goodsDeclaration', req.body.goodsDeclaration, `Declaration details must be ${MAX_TEXT_BOX_LENGTH} characters or less`),
    ],
    [
      new ValidationRule(validator.notEmpty, 'freeCirculation', req.body.freeCirculation, 'Select a free circulation value'),
    ],
    [
      new ValidationRule(validator.notEmpty, 'visitReason', req.body.visitReason, 'Select a reason for visit'),
    ],
  ];
};
