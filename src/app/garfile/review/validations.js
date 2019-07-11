const ValidationRule = require('../../../common/models/ValidationRule.class');
const validator = require('../../../common/utils/validator');

const voyageDateMsg = 'Arrival date must not be earlier than departure date';
const validateCaptainCrewMsg = 'There must be at least one captain or crew member on the voyage.';
const registrationMsg = 'Aircraft registration must be completed';
const responsibleMsg = 'Responsible person details must be completed';

module.exports.validations = (garfile, garpeople) => {
  const voyageDateObj = { departureDate: garfile.departureDate, arrivalDate: garfile.arrivalDate };

  return [
    [
      new ValidationRule(validator.isValidDepAndArrDate, 'voyageDates', voyageDateObj, voyageDateMsg),
    ],
    [
      new ValidationRule(validator.notEmpty, 'registration', garfile.registration, registrationMsg),
    ],
    [
      new ValidationRule(validator.notEmpty, 'garPeople', garpeople.items, validateCaptainCrewMsg),
    ],
    [
      new ValidationRule(validator.notEmpty, 'responsibleGivenName', garfile.responsibleGivenName, responsibleMsg),
    ],
  ];
};
