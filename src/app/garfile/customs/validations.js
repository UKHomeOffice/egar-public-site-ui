const validator = require('../../../common/utils/validator');
const ValidationRule = require('../../../common/models/ValidationRule.class');
const { MAX_TEXT_BOX_LENGTH } = require('../../../common/config/index');

module.exports.validations = (req) => {
  const {
    prohibitedGoods,
    goodsDeclaration,
    visitReason,
  } = req.body;

  const validations = [
    [
      new ValidationRule(validator.notEmpty, 'prohibitedGoods', prohibitedGoods, 'Select a value for customs declaration'),
    ],
    [
      new ValidationRule(validator.validTextLength, 'goodsDeclaration', { value: goodsDeclaration, maxLength: MAX_TEXT_BOX_LENGTH }, `Declaration details must be ${MAX_TEXT_BOX_LENGTH} characters or less`),
    ],
    [
      new ValidationRule(validator.notEmpty, 'visitReason', visitReason, 'Select a reason for visit'),
    ],
  ];

  if (prohibitedGoods === 'Yes') {
    validations[1].push(new ValidationRule(validator.notEmpty, 'goodsDeclaration', goodsDeclaration, 'Please enter customs declaration details'));
  }

  return validations;
};
