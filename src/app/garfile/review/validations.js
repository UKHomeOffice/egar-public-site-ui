const ValidationRule = require('../../../common/models/ValidationRule.class');
const validator = require('../../../common/utils/validator');
const voyageDateMsg = require('../../../locales/en').validator_msg_voyage_dates;

const validateCaptainCrewMsg = 'There must be at least one captain or crew member on the voyage.';
const registrationMsg = 'Aircraft registration must be completed';
const responsibleMsg = 'Responsible person details must be completed';

module.exports.validations = (garfile, garpeople) => {
  const { departureDate, departureTime, arrivalDate, arrivalTime, registration, responsibleGivenName } = garfile;
  const voyageDateTimeObj = { departureDate, departureTime, arrivalDate, arrivalTime };

  return [
    [
      new ValidationRule(validator.isValidDepAndArrDate, 'voyageDates', voyageDateTimeObj, voyageDateMsg),
    ],
    [
      new ValidationRule(validator.notEmpty, 'registration', registration, registrationMsg),
    ],
    [
      new ValidationRule(validator.notEmpty, 'garPeople', garpeople.items, validateCaptainCrewMsg),
    ],
    [
      new ValidationRule(validator.notEmpty, 'responsibleGivenName', responsibleGivenName, responsibleMsg),
    ],
  ];
};
