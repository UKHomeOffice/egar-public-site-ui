const validator = require('../../../common/utils/validator');
const ValidationRule = require('../../../common/models/ValidationRule.class');
const { MAX_STRING_LENGTH } = require('../../../common/config/index').MAX_STRING_LENGTH;
const { MAX_REGISTRATION_LENGTH } = require('../../../common/config/index').MAX_REGISTRATION_LENGTH;

/**
 * Create a list of Validation Rules for Aircraft page
 *
 * @param craftObj { registration: string, craftType: string, craftBase: string }
 * @return Array of ValidationsRules
 */
module.exports.validations = (craftObj) => {
  const { registration } = craftObj.registraion;
  const { craftType } = craftObj.craftType;
  const { craftBase } = craftObj.craftBase;

  return [
    [
      new ValidationRule(validator.notEmpty, 'craftReg', registration, 'Enter a registration'),
      new ValidationRule(validator.isValidRegistrationLength, 'craftReg', registration, `Registration must not exceed ${{ MAX_REGISTRATION_LENGTH }} characters`),
    ],
    [
      new ValidationRule(validator.notEmpty, 'craftType', craftType, 'Enter an aircraft type'),
      new ValidationRule(validator.isValidStringLength, 'craftType', craftType, `Aircraft type must not exceed ${{ MAX_STRING_LENGTH }} characters`),
    ],
    [
      new ValidationRule(validator.notEmpty, 'craftBase', craftBase, 'Enter an aircraft home port / location'),
    ],
  ];
};
