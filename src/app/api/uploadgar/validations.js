const validator = require('../../../common/utils/validator');
const ValidationRule = require('../../../common/models/ValidationRule.class');

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
    ],
    [
      new ValidationRule(validator.notEmpty, '', voyageObj.craftType, 'Enter the type of the craft'),
    ],
    [
      new ValidationRule(validator.notEmpty, '', voyageObj.craftBase, 'Enter the usual base of the craft'),
    ],
    [
      new ValidationRule(validator.notSameValues, '', [voyageObj.arrivalPort, voyageObj.departurePort], 'Arrival port must be different to departure port'),
    ]
  ];

  // freeCirculation and visitReason are optional values as of this time, only validate if they are provided
  // The below will display an error message identifying the person by firstName + lastName
  // This will be blank in the case where neither piece of information is entered
  if (voyageObj.freeCirculation) validationArr.push(new ValidationRule(validator.validFreeCirculation, '', voyageObj.freeCirculation, 'Enter a valid value for free circulation'));
  if (voyageObj.visitReason) validationArr.push(new ValidationRule(validator.validVisitReason, '', voyageObj.visitReason, 'Enter a valid value for the reason of visit'));

  const manifest = crewArr.concat(passengersArr);
  manifest.forEach((crew) => {
    validationArr.push([new ValidationRule(validator.notEmpty, '', crew.documentType, `Enter a document type for ${crew.firstName} ${crew.lastName}`)]);
    validationArr.push([new ValidationRule(validator.notEmpty, '', crew.issuingState, `Enter a document issuing state for ${crew.firstName} ${crew.lastName}`)]);
    validationArr.push([new ValidationRule(validator.validISOCountryLength, '', crew.issuingState, `Enter a valid document issuing state for ${crew.firstName} ${crew.lastName}. Must be a ISO 3166 country code`)]);
    validationArr.push([new ValidationRule(validator.notEmpty, '', crew.documentNumber, `Enter a document number for ${crew.firstName} ${crew.lastName}`)]);
    validationArr.push([new ValidationRule(validator.notEmpty, '', crew.lastName, `Enter a surname for ${crew.firstName}`)]);
    validationArr.push([new ValidationRule(validator.notEmpty, '', crew.firstName, `Enter a given name for ${crew.lastName}`)]);
    validationArr.push([new ValidationRule(validator.notEmpty, '', crew.gender, `Enter a gender for ${crew.firstName} ${crew.lastName}`)]);
    validationArr.push([new ValidationRule(validator.validGender, '', crew.gender, `Enter a valid gender for ${crew.firstName} ${crew.lastName}`)]);
    validationArr.push([new ValidationRule(validator.notEmpty, '', crew.dateOfBirth, `Enter a date of birth for ${crew.firstName} ${crew.lastName}`)]);
    validationArr.push([new ValidationRule(validator.notEmpty, '', crew.placeOfBirth, `Enter a place of birth for ${crew.firstName} ${crew.lastName}`)]);
    validationArr.push([new ValidationRule(validator.notEmpty, '', crew.nationality, `Enter a nationality for ${crew.firstName} ${crew.lastName}`)]);
    validationArr.push([new ValidationRule(validator.validISOCountryLength, '', crew.nationality, `Enter a valid nationality for ${crew.firstName} ${crew.lastName}. Must be a ISO 3166 country code`)]);
    validationArr.push([new ValidationRule(validator.notEmpty, '', crew.documentExpiryDate, `Enter a document expirty date for ${crew.firstName} ${crew.lastName}`)]);
  });

  return validationArr;
};
