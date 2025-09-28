/* eslint-disable no-underscore-dangle */

import i18n from 'i18n';

import validator from '../../../common/utils/validator.js';
import ValidationRule from '../../../common/models/ValidationRule.class.js';
import { MAX_STRING_LENGTH, MAX_REGISTRATION_LENGTH } from '../../../common/config/index.js';
import loggerFactory from '../../../common/utils/logger.js';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const logger = loggerFactory(__filename);


/**
 * Create a list of Validation Rules for Aircraft page
 *
 * @param {Object} craftObj { registration: string, craftType: string, craftBase: string }
 * @return {Array} Array of ValidationsRules
 */
const validations = (craftObj) => {

  logger.info('CraftObj: ' + JSON.stringify(craftObj));

  const { registration, craftType, craftBasePort, craftBaseLat, craftBaseLong, portChoice } = craftObj;

  const validationsArray = [
    [
      new ValidationRule(validator.notEmpty, 'registration', registration, i18n.__('validation_aircraft_registration')),
      new ValidationRule(validator.isValidRegistrationLength, 'registration', registration, `Registration must be ${MAX_REGISTRATION_LENGTH} characters or less`),
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


export default {
  validations
};
