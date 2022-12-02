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
    supportingInformation,
    intentionValue,
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
      new ValidationRule(validator.notEmpty, 'supportingInformation', { value: supportingInformation, maxLength: MAX_TEXT_BOX_LENGTH - 50 }, `Supporting information must be ${MAX_TEXT_BOX_LENGTH - 50} characters or less`),
    ],
    [
      new ValidationRule(validator.notEmpty, 'intentionValue', intentionValue, 'Select a value for customs declaration'),
    ],
  ];

  if (prohibitedGoods === 'Yes') {
    validations[1].push(new ValidationRule(validator.notEmpty, 'goodsDeclaration', goodsDeclaration, 'Please enter customs declaration details'));
  }
  if (baggage === 'Yes') {
    validations[3].push(new ValidationRule(validator.notEmpty, 'baggageDeclaration', baggageDeclaration, 'Please enter baggage declaration details'));
  }
  return validations;
};
