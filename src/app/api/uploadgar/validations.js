/* eslint-disable no-underscore-dangle */

import i18n from 'i18n';

import airportValidation from '../../../common/utils/airportValidation.js';
import validator from '../../../common/utils/validator.js';
import ValidationRule from '../../../common/models/ValidationRule.class.js';
import { MAX_STRING_LENGTH, MAX_REGISTRATION_LENGTH } from '../../../common/config/index.js';
import utils from '../../../common/utils/utils.js';

const listedDocumentTypes = utils.documentTypes
  .map(documentType => `"${documentType}"`)
  .join(", ")

export const getVoyageFieldLabel = (key) => {
  const labels = {
    arrivalPort: i18n.__('field_arrival_port'),
    departurePort: i18n.__('field_departure_port'),
    arrivalTime: i18n.__('field_arrival_time'),
    departureTime: i18n.__('field_departure_time'),
    arrivalDate: i18n.__('field_arrival_date'),
    departureDate: i18n.__('field_departure_date'),
    registration: i18n.__('field_aircraft_registration'),
    craftType: i18n.__('field_aircraft_type'),
    craftBase: i18n.__('field_aircraft_base'),
  };
  return labels[key] || `Voyage field (${key})`;
};

export const getCrewFieldLabel = (key) => { //NOSONAR
  switch (key) {
    case 'documentType': return i18n.__('field_travel_document_type');
    case 'issuingState': return i18n.__('field_issuing_state');
    case 'documentNumber': return i18n.__('field_travel_document_number');
    case 'lastName': return i18n.__('field_surname');
    case 'firstName': return i18n.__('field_given_name');
    case 'dateOfBirth': return i18n.__('field_dob');
    case 'placeOfBirth': return i18n.__('field_birth_place');
    case 'documentExpiryDate': return i18n.__('field_document_expiry_date');
    case 'gender':
    case 'nationality': return i18n.__(`field_${key}`);
    default: return `One of the value (${key})`;
  }
}

export const validations = (voyageObj, crewArr, passengersArr) => {
  const validationArr = [
    [new ValidationRule(validator.isValidAirportCode, '', voyageObj.arrivalPort, 'Arrival port should be an ICAO or IATA code')],
    [new ValidationRule(validator.notEmpty, '', voyageObj.arrivalPort, 'Enter a value for the arrival port')],
    [new ValidationRule(validator.preventZ, '', voyageObj.arrivalPort, `Arrival Port: ${__('prevent_zzzz_or_yyyy_message')}`)],
    [new ValidationRule(validator.isValidAirportCode, '', voyageObj.departurePort, 'Departure port should be an ICAO or IATA code')],
    [new ValidationRule(validator.notEmpty, '', voyageObj.departurePort, 'Enter a value for the departure port')],
    [new ValidationRule(validator.preventZ, '', voyageObj.departurePort, `Departure Port: ${__('prevent_zzzz_or_yyyy_message')}`)],
    [new ValidationRule(airportValidation.includesOneBritishAirport, '', [voyageObj.departurePort, voyageObj.arrivalPort], airportValidation.notBritishMsg)],
    [new ValidationRule(validator.notEmpty, '', voyageObj.arrivalTime, 'Enter a value for the arrival time')],
    [new ValidationRule(validator.notEmpty, '', voyageObj.departureTime, 'Enter a value for the departure time')],
    [new ValidationRule(validator.notEmpty, '', voyageObj.arrivalDate, 'Enter a value for the arrival date')],
    [new ValidationRule(validator.notEmpty, '', voyageObj.departureDate, 'Enter a value for the departure date')],
    [new ValidationRule(validator.dateNotInPast, '', voyageObj.departureDate, __('field_departure_date_should_not_be_in_the_past'))],
    [new ValidationRule(validator.dateNotInPast, '', voyageObj.arrivalDate, __('field_arrival_date_too_far_in_future'))],
    [new ValidationRule(validator.dateNotMoreThanMonthInFuture, '', voyageObj.arrivalDate, __('field_arrival_date_too_far_in_future'))],
    
    [
      new ValidationRule(validator.notEmpty, '', voyageObj.registration, 'Enter the registration of the craft'),
      new ValidationRule(validator.isValidRegistrationLength, '', voyageObj.registration, `Aircraft registration must be ${MAX_REGISTRATION_LENGTH} characters or less`),
    ],
    [
      new ValidationRule(validator.notEmpty, '', voyageObj.craftType, 'Enter the type of the craft'),
      new ValidationRule(validator.isValidStringLength, '', voyageObj.craftType, `Aircraft type must be ${MAX_STRING_LENGTH} characters or less`),
    ],
    [new ValidationRule(validator.notEmpty, '', voyageObj.craftBase, 'Enter the aircraft home port / location of the craft')],
    // *** Added validations below so that users can't enter past date as a departure in their gar template ***//
    [new ValidationRule(validator.notSameValues, '', [voyageObj.arrivalPort, voyageObj.departurePort], 'Arrival port must be different to departure port')],
  ];

  // freeCirculation and visitReason are optional values as of this time,
  // only validate if they are provided
  // The below will display an error message identifying the person by firstName + lastName
  // This will be blank in the case where neither piece of information is entered
  if (voyageObj.freeCirculation) validationArr.push(new ValidationRule(validator.validFreeCirculation, '', voyageObj.freeCirculation, 'Enter a valid value for free circulation'));
  if (voyageObj.visitReason) validationArr.push(new ValidationRule(validator.validVisitReason, '', voyageObj.visitReason, 'Enter a valid value for the reason of visit'));

  Object.keys(voyageObj).forEach((key) => {
    if (typeof voyageObj[key] === 'string' && !validator.isPrintable(voyageObj[key])) {
      const fieldLabel = getVoyageFieldLabel(key);
      validationArr.push([
        new ValidationRule(validator.isPrintable, '', voyageObj[key], `${fieldLabel} contains invalid multiple lines in the cell`),
      ]);
    }
  });
  const manifest = crewArr.concat(passengersArr);
  manifest.forEach((crew) => {
    const crewLabel = i18n.__('validator_api_uploadgar_people_type_crew');
    const passengerLabel = i18n.__('validator_api_uploadgar_people_type_passenger');
    const peopleType = crew.peopleType === 'Crew' ? crewLabel : passengerLabel;
    const name = i18n.__('validator_api_uploadgar_person_type_person_name', { peopleType, firstName: crew.firstName, lastName: crew.lastName });

    validationArr.push([new ValidationRule(
      validator.isValidDocumentType, 
      '', 
      crew.documentType, 
      `Enter a valid document type for ${name}, it should be ${listedDocumentTypes}, not "${crew.documentType ?? ''}"`
    )]);
    validationArr.push([new ValidationRule(
      validator.isOtherDocumentWithDocumentDesc, 
      '', 
      [crew.documentType, crew.documentDesc], 
      `For ${name}, "${crew.documentType}" document type should be "Other" or remove "${crew.documentDesc}" value from document description`
    )]);

    if (crew.documentType === 'Other') {
      validationArr.push([
        new ValidationRule(validator.notEmpty, 'travelDocumentOther', crew.documentDesc, `For ${name} enter the document description you are using`),
        new ValidationRule(validator.validName, 'travelDocumentOther', crew.documentDesc, `For ${name} enter a real document description`),
      ]);
    }
    
    validationArr.push([new ValidationRule(validator.notEmpty, '', crew.issuingState, `Enter a document issuing state for ${name}`)]);
    validationArr.push([
      new ValidationRule(validator.validISOCountryLength, '', crew.issuingState, `Enter a valid document issuing state for ${name}. Must be a ISO 3166 country code`),
      new ValidationRule(validator.isValidNationality, '', crew.issuingState, `Enter a valid document issuing state for ${name}. Must be a ISO 3166 country code`),
    ]);
    validationArr.push([
      new ValidationRule(validator.notEmpty, '', crew.documentNumber, `Enter a document number for ${name}`),
      new ValidationRule(validator.isValidStringLength, '', crew.documentNumber, `Travel document number for ${name} must be ${MAX_STRING_LENGTH} characters or less`),
      new ValidationRule(validator.isAlphanumeric, '', crew.documentNumber, `Travel document number for ${name} must be alphanumeric only.`),
    ]);
    validationArr.push([
      new ValidationRule(validator.notEmpty, '', crew.lastName, `Enter a surname for ${peopleType} ${crew.firstName}`),
      new ValidationRule(validator.isValidStringLength, '', crew.lastName, `Surname for ${name} must be ${MAX_STRING_LENGTH} characters or less`),
      new ValidationRule(validator.isAlpha, '', crew.lastName, `Surname for ${name} must not contain special characters, apostrophes or numbers`),
    ]);
    validationArr.push([
      new ValidationRule(validator.notEmpty, '', crew.firstName, `Enter given names for ${peopleType} ${crew.lastName}`),
      new ValidationRule(validator.isValidStringLength, '', crew.firstName, `Given names for ${name} must be ${MAX_STRING_LENGTH} characters or less`),
      new ValidationRule(validator.isAlpha, '', crew.firstName, `Given names for ${name} must not contain special characters, apostrophes or numbers`),
    ]);
    validationArr.push([new ValidationRule(validator.notEmpty, '', crew.gender, `Enter a sex for ${name}`)]);
    validationArr.push([new ValidationRule(validator.validGender, '', crew.gender, `Enter a valid sex for ${name}`)]);
    validationArr.push([
      new ValidationRule(validator.notEmpty, '', crew.dateOfBirth, `Enter a date of birth for ${name}. (Check cell is in Date not General format).`),
      new ValidationRule(validator.realDateFromString, '', crew.dateOfBirth, `Enter a valid date of birth for ${name}. (Check cell is in Date not General format. Read GAR Guidance tab)`),
      new ValidationRule(validator.birthDate, '', crew.dateOfBirth, `Enter a valid date of birth for ${name}. (Check cell is in Date not General format. Read GAR Guidance tab)`),
    ]);
    validationArr.push([
      new ValidationRule(validator.isValidOptionalStringLength, '', crew.placeOfBirth, `Place of birth for ${name} must be ${MAX_STRING_LENGTH} characters or less`),
    ]);
    validationArr.push([new ValidationRule(validator.notEmpty, '', crew.nationality, `Enter a nationality for ${name}`)]);
    validationArr.push([
      new ValidationRule(validator.validISOCountryLength, '', crew.nationality, `Enter a valid nationality for ${name}. Must be a ISO 3166 country code`),
      new ValidationRule(validator.isValidNationality, '', crew.nationality, `Enter a valid nationality for ${name}. Must be a ISO 3166 country code`),
    ]);
    validationArr.push([
      new ValidationRule(validator.notEmpty, '', crew.documentExpiryDate, `Enter a Travel Document expiry date for ${name}. (Check cell is in Date not General format).`),
      new ValidationRule(validator.realDateFromString, '', crew.documentExpiryDate, `Enter a valid Travel Document expiry date for ${name}. (Check cell is in Date not General format. Read GAR Guidance tab)`),
      new ValidationRule(validator.passportExpiryDate, '', crew.documentExpiryDate, `Enter a valid Travel Document expiry date for ${name}. (Check cell is in Date not General format. Read GAR Guidance tab)`),
    ]);
    Object.keys(crew).forEach((key) => {
      if (typeof crew[key] === 'string' && !validator.isPrintable(crew[key])) {
        const fieldLabel = getCrewFieldLabel(key);
        validationArr.push([
          new ValidationRule(validator.isPrintable, '', crew[key], `${fieldLabel} for ${name} contains invalid multiple lines in the cell`),
        ]);
      }
    });
  });
  return validationArr;
};
