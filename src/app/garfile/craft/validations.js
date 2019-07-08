const validator = require('../../../common/utils/validator');
const ValidationRule = require('../../../common/models/ValidationRule.class');
const { MAX_STRING_LENGTH } = require('../../../common/config/index');
const { MAX_REGISTRATION_LENGTH } = require('../../../common/config/index');

/**
 * Create a list of Validation Rules for Aircraft page
 *
 * @param {Object} craftObj { registration: string, craftType: string, craftBase: string }
 * @return {Array} Array of ValidationsRules
 */
module.exports.validations = (craftObj) => {
  const { registration } = craftObj;
  const { craftType } = craftObj;
  const { craftBase } = craftObj;

  return [
    [
      new ValidationRule(validator.notEmpty, 'craftReg', registration, 'Enter a registration'),
      new ValidationRule(validator.isValidRegistrationLength, 'craftReg', registration, `Registration must be ${MAX_REGISTRATION_LENGTH} characters or less`),
    ],
    [
      new ValidationRule(validator.notEmpty, 'craftType', craftType, 'Enter an aircraft type'),
      new ValidationRule(validator.isValidStringLength, 'craftType', craftType, `Aircraft type must be ${MAX_STRING_LENGTH} characters or less`),
    ],
    [
      new ValidationRule(validator.notEmpty, 'craftBase', craftBase, 'Enter an aircraft home port / location'),
    ],
  ];
};
