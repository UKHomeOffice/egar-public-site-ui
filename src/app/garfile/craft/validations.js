/* eslint-disable no-underscore-dangle */

const i18n = require('i18n');

const validator = require('../../../common/utils/validator');
const ValidationRule = require('../../../common/models/ValidationRule.class');
const { MAX_STRING_LENGTH, MAX_REGISTRATION_LENGTH } = require('../../../common/config/index');

/**
 * Create a list of Validation Rules for Aircraft page
 *
 * @param {Object} craftObj { registration: string, craftType: string, craftBase: string }
 * @return {Array} Array of ValidationsRules
 */
module.exports.validations = (craftObj) => {
  const { registration, craftType, craftBase } = craftObj;

  return [
    [
      new ValidationRule(validator.notEmpty, 'craftReg', registration, i18n.__('validation_aircraft_registration')),
      new ValidationRule(validator.isValidRegistrationLength, 'craftReg', registration, `Registration must be ${MAX_REGISTRATION_LENGTH} characters or less`),
    ],
    [
      new ValidationRule(validator.notEmpty, 'craftType', craftType, i18n.__('validation_aircraft_type')),
      new ValidationRule(validator.isValidStringLength, 'craftType', craftType, `Aircraft type must be ${MAX_STRING_LENGTH} characters or less`),
    ],
    [
      new ValidationRule(validator.notEmpty, 'craftBase', craftBase, i18n.__('validation_aircraft_base')),
    ],
  ];
};
