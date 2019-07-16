/* eslint-disable no-underscore-dangle */

const i18n = require('i18n');

const validator = require('../../../common/utils/validator');
const ValidationRule = require('../../../common/models/ValidationRule.class');
const { MAX_STRING_LENGTH } = require('../../../common/config/index');
const { MAX_REGISTRATION_LENGTH } = require('../../../common/config/index');

module.exports.validations = (voyageObj, crewArr, passengersArr) => {
  const validationArr = [
    [
      new ValidationRule(validator.notEmpty, '', voyageObj.arrivalPort, 'Enter a value for the arrival port'),
    ],
    [
      new ValidationRule(validator.notEmpty, '', voyageObj.departurePort, 'Enter a value for the departure port'),
    ],
    [
      new ValidationRule(validator.notEmpty, '', voyageObj.arrivalTime, 'Enter a value for the arrival time'),
    ],
    [
      new ValidationRule(validator.notEmpty, '', voyageObj.departureTime, 'Enter a value for the departure time'),
    ],
    [
      new ValidationRule(validator.notEmpty, '', voyageObj.arrivalDate, 'Enter a value for the arrival date'),
    ],
    [
      new ValidationRule(validator.notEmpty, '', voyageObj.departureDate, 'Enter a value for the departure date'),
    ],
    [
      new ValidationRule(validator.notEmpty, '', voyageObj.registration, 'Enter the registration of the craft'),
      new ValidationRule(validator.isValidRegistrationLength, '', voyageObj.registration, `Aircraft registration must be ${MAX_REGISTRATION_LENGTH} characters or less`),
    ],
    [
      new ValidationRule(validator.notEmpty, '', voyageObj.craftType, 'Enter the type of the craft'),
      new ValidationRule(validator.isValidStringLength, '', voyageObj.craftType, `Aircraft type must be ${MAX_STRING_LENGTH} characters or less`),
    ],
    [
      new ValidationRule(validator.notEmpty, '', voyageObj.craftBase, 'Enter the aircraft home port / location of the craft'),
    ],
    [
      new ValidationRule(validator.notSameValues, '', [voyageObj.arrivalPort, voyageObj.departurePort], 'Arrival port must be different to departure port'),
    ],
  ];

  // freeCirculation and visitReason are optional values as of this time,
  // only validate if they are provided
  // The below will display an error message identifying the person by firstName + lastName
  // This will be blank in the case where neither piece of information is entered
  if (voyageObj.freeCirculation) validationArr.push(new ValidationRule(validator.validFreeCirculation, '', voyageObj.freeCirculation, 'Enter a valid value for free circulation'));
  if (voyageObj.visitReason) validationArr.push(new ValidationRule(validator.validVisitReason, '', voyageObj.visitReason, 'Enter a valid value for the reason of visit'));

  const manifest = crewArr.concat(passengersArr);
  manifest.forEach((crew) => {
    const crewLabel = i18n.__('validation_api_uploadgar_people_type_crew');
    const passengerLabel = i18n.__('validation_api_uploadgar_people_type_passenger');
    const peopleType = crew.peopleType === 'Crew' ? crewLabel : passengerLabel;
    const name = i18n.__('validation_api_uploadgar_person_type_person_name', { peopleType, firstName: crew.firstName, lastName: crew.lastName });
    validationArr.push([new ValidationRule(validator.notEmpty, '', crew.documentType, `Enter a valid document type for ${name}`)]);
    validationArr.push([new ValidationRule(validator.notEmpty, '', crew.issuingState, `Enter a document issuing state for ${name}`)]);
    validationArr.push([
      new ValidationRule(validator.validISOCountryLength, '', crew.issuingState, `Enter a valid document issuing state for ${name}. Must be a ISO 3166 country code`),
      new ValidationRule(validator.validISO3Country, '', crew.issuingState, `Enter a valid document issuing state for ${name}. Must be a ISO 3166 country code`),
    ]);
    validationArr.push([
      new ValidationRule(validator.notEmpty, '', crew.documentNumber, `Enter a document number for ${name}`),
      new ValidationRule(validator.isValidStringLength, '', crew.documentNumber, `Travel document number for ${name} must be ${MAX_STRING_LENGTH} characters or less`),
    ]);
    validationArr.push([
      new ValidationRule(validator.notEmpty, '', crew.lastName, `Enter a surname for ${peopleType} ${crew.firstName}`),
      new ValidationRule(validator.isValidStringLength, '', crew.lastName, `Surname for ${name} must be ${MAX_STRING_LENGTH} characters or less`),
    ]);
    validationArr.push([
      new ValidationRule(validator.notEmpty, '', crew.firstName, `Enter a given name for ${peopleType} ${crew.lastName}`),
      new ValidationRule(validator.isValidStringLength, '', crew.firstName, `Given name for ${name} must be ${MAX_STRING_LENGTH} characters or less`),
    ]);
    validationArr.push([new ValidationRule(validator.notEmpty, '', crew.gender, `Enter a gender for ${name}`)]);
    validationArr.push([new ValidationRule(validator.validGender, '', crew.gender, `Enter a valid gender for ${name}`)]);
    validationArr.push([new ValidationRule(validator.notEmpty, '', crew.dateOfBirth, `Enter a date of birth for ${name}`)]);
    validationArr.push([
      new ValidationRule(validator.notEmpty, '', crew.placeOfBirth, `Enter a place of birth for ${name}`),
      new ValidationRule(validator.isValidStringLength, '', crew.placeOfBirth, `Place of birth for ${name} must be ${MAX_STRING_LENGTH} characters or less`),
    ]);
    validationArr.push([new ValidationRule(validator.notEmpty, '', crew.nationality, `Enter a nationality for ${name}`)]);
    validationArr.push([
      new ValidationRule(validator.validISOCountryLength, '', crew.nationality, `Enter a valid nationality for ${name}. Must be a ISO 3166 country code`),
      new ValidationRule(validator.validISO3Country, '', crew.nationality, `Enter a valid nationality for ${name}. Must be a ISO 3166 country code`),
    ]);
    validationArr.push([new ValidationRule(validator.notEmpty, '', crew.documentExpiryDate, `Enter a document expiry date for ${name}`)]);
  });

  return validationArr;
};
