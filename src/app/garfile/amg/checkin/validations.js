/* eslint-disable no-underscore-dangle */

const i18n = require('i18n');
const ValidationRule = require('../../../../common/models/ValidationRule.class');
const validator = require('../../../../common/utils/validator');

const validateCaptainCrewMsg = 'There must be at least one captain or crew member on the voyage.';
const registrationMsg = 'Aircraft registration must be completed';
const responsibleMsg = 'Responsible person details must be completed';
const customsMsg = 'Customs Declaration question not answered';


module.exports.validations = (garfile, garpeople) => {
  const voyageDateMsg = i18n.__('validator_msg_voyage_dates');
  const {
    departureDate, departureTime, arrivalDate, arrivalTime, registration, responsibleGivenName, prohibitedGoods, baggage, visitReason, intentionValue,
  } = garfile;
  const voyageDateTimeObj = {
    departureDate, departureTime, arrivalDate, arrivalTime,
  };

  return [
    [
      new ValidationRule(validator.isValidDepAndArrDate, 'departure', voyageDateTimeObj, voyageDateMsg),
    ],
    [
      new ValidationRule(validator.notEmpty, 'aircraft', registration, registrationMsg),
    ],
    [
      new ValidationRule(validator.notEmpty, 'manifest', garpeople.items, validateCaptainCrewMsg),
    ],
    [
      new ValidationRule(validator.notEmpty, 'responsiblePerson', responsibleGivenName, responsibleMsg),
    ],
    // Customs screen validations
    [
      new ValidationRule(validator.notEmpty, 'customs', visitReason, 'Visit Reason question not answered'),
    ],
    [
      new ValidationRule(validator.notEmpty, 'intentionValue', intentionValue, customsMsg),
    ],
  ];
};
