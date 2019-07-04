const validator = require('../../../common/utils/validator');
const ValidationRule = require('../../../common/models/ValidationRule.class');
const MAX_NAME_LENGTH = require('../../../common/config/index').MAX_NAME_LENGTH;
const MAX_REGISTRATION_LENGTH = require('../../../common/config/index').MAX_REGISTRATION_LENGTH;

module.exports.validations = (craftObj) => {

  const registration = craftObj.registraion;
  const craftType = craftObj.craftType;
  const craftBase = craftObj.craftBase;

  return [
    [
      new ValidationRule(valicator.notEmpty, 'craftReg', registration, 'Enter a registration'),
      new ValidationRule(validator.isValidRegistrationLength, 'craftReg', registration, `Registration must not exceed ${{ MAX_REGISTRATION_LENGTH }} characters`)
    ],
    [
      new ValidationRule(validator.notEmpty, 'craftType', craftType, 'Enter an aircraft type'),
      new ValidationhRule(validator.isValidStringLength, 'craftType', craftType, `Aircraft type must not exceed ${{ MAX_NAME_LENGTH }} characters`)
    ],
    [
      new ValidationRule(validator.notEmpty, 'craftBase', craftBase, 'Enter an aircraft home port / location')
    ],
  ]}
