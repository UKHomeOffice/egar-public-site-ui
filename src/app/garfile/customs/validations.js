const validator = require('../../../common/utils/validator');
const ValidationRule = require('../../../common/models/ValidationRule.class');
const { MAX_TEXT_BOX_LENGTH } = require('../../../common/config/index');

module.exports.validations = (req) => {
  const {
    prohibitedGoods,
    goodsDeclaration,
    baggage,
    baggageDeclaration,
    passengerTravellingReason,
    visitReason,
    fixedBasedOperator,
    fixedBasedOperatorAnswer,
    supportingInformation,
    operatorAnswer,
  } = req.body;

  const validations = [
    [
      new ValidationRule(validator.notEmpty, 'prohibitedGoods', prohibitedGoods, 'Select a value for customs declaration'),
    ],
    [
      new ValidationRule(validator.validTextLength, 'goodsDeclaration', { value: goodsDeclaration, maxLength: MAX_TEXT_BOX_LENGTH - 100 }, `Declaration details must be ${MAX_TEXT_BOX_LENGTH - 100} characters or less`),
    ],
    [
      new ValidationRule(validator.notEmpty, 'baggage', baggage, 'Select a value for baggage declaration'),
    ],
    [
      new ValidationRule(validator.validTextLength, 'baggageDeclaration', { value: baggageDeclaration, maxLength: MAX_TEXT_BOX_LENGTH - 100 }, `Baggage details must be ${MAX_TEXT_BOX_LENGTH - 100} characters or less`),
    ],
    [
      new ValidationRule(validator.notEmpty, 'passengerTravellingReason', { value: passengerTravellingReason, maxLength: MAX_TEXT_BOX_LENGTH }, `Passenger travelling reason must be ${MAX_TEXT_BOX_LENGTH } characters or less`),
    ],
    [
      new ValidationRule(validator.notEmpty, 'visitReason', visitReason, 'Select a reason for visit'),
    ],
    [
      new ValidationRule(validator.notEmpty, 'fixedBasedOperator', fixedBasedOperator, 'Select a value for baggage declaration'),
    ],
    [
      new ValidationRule(validator.validTextLength, 'fixedBasedOperatorAnswer', { value: fixedBasedOperatorAnswer, maxLength: MAX_TEXT_BOX_LENGTH - 100 }, `Fixed based operator details must be ${MAX_TEXT_BOX_LENGTH - 100} characters or less`),
    ],
    [
      new ValidationRule(validator.validTextLength, 'operatorAnswer', { value: operatorAnswer, maxLength: MAX_TEXT_BOX_LENGTH - 100 }, `operator details must be ${MAX_TEXT_BOX_LENGTH - 100} characters or less`),
    ],
    [
      new ValidationRule(validator.notEmpty, 'supportingInformation', { value: supportingInformation, maxLength: MAX_TEXT_BOX_LENGTH - 50 }, `Supporting information must be ${MAX_TEXT_BOX_LENGTH - 50} characters or less`),
    ],
  ];

  if (prohibitedGoods === 'Yes') {
    validations[1].push(new ValidationRule(validator.notEmpty, 'goodsDeclaration', goodsDeclaration, 'Please enter customs declaration details'));
  }
  if (baggage === 'Yes') {
    validations[3].push(new ValidationRule(validator.notEmpty, 'baggageDeclaration', baggageDeclaration, 'Please enter baggage declaration details'));
  }
  if (fixedBasedOperator === 'Fixed Based Operator') {
    validations[7].push(new ValidationRule(validator.notEmpty, 'fixedBasedOperatorAnswer', fixedBasedOperatorAnswer, 'Please enter Name and base location'));
  }
  if (fixedBasedOperator === 'Operator') {
    validations[8].push(new ValidationRule(validator.notEmpty, 'operatorAnswer', operatorAnswer, 'Please enter Name of Operator'));
  }
  return validations;
};
