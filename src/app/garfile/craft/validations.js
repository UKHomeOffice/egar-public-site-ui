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
const validations = (craftObj) => {
  const { craftReg, craftType, craftBasePort, craftBaseLat, craftBaseLong, portChoice } = craftObj;

  const validationsArray = [
    [
      new ValidationRule(validator.notEmpty, 'craftReg', craftReg, i18n.__('validation_aircraft_registration')),
      new ValidationRule(validator.isValidRegistrationLength, 'craftReg', craftReg, `Registration must be ${MAX_REGISTRATION_LENGTH} characters or less`),
    ],
    [
      new ValidationRule(validator.notEmpty, 'craftType', craftType, i18n.__('validation_aircraft_type')),
      new ValidationRule(validator.isValidStringLength, 'craftType', craftType, `Aircraft type must be ${MAX_STRING_LENGTH} characters or less`),
    ],
  ];

  if (portChoice === 'Yes') {
    validationsArray.push([
      new ValidationRule(validator.notEmpty, 'craftBasePort', craftBasePort, __('validation_aircraft_base')),
      new ValidationRule(validator.isValidAirportCode, 'craftBasePort', craftBasePort, 'Aircraft port should be an ICAO or IATA code')
    ]);
  } else {
    validationsArray.push(
      [new ValidationRule(validator.latitude, 'craftBaseLat', craftBaseLat, __('field_latitude_validation'))],
      [new ValidationRule(validator.longitude, 'craftBaseLong', craftBaseLong, __('field_longitude_validation'))]
    )
  }
  return validationsArray;
};


module.exports = {
  validations
}
