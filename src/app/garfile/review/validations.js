/* eslint-disable no-underscore-dangle */

import i18n from 'i18n';

import ValidationRule from '../../../common/models/ValidationRule.class.js';
import validator from '../../../common/utils/validator.js';

const validateManifestMsg = 'An invalid manifest was provided to the server';
const registrationMsg = 'Aircraft registration must be completed';
const responsibleMsg = 'Responsible person details must be completed';
const customsMsg = 'Customs Declaration question not answered';


export default (garfile, garpeople, frmUpload = false) => {
  const voyageDateMsg = i18n.__('validator_msg_voyage_dates');
  const {
    departureDate, departureTime, arrivalDate, arrivalTime, registration, responsibleGivenName, prohibitedGoods, baggage, visitReason, intentionValue,
  } = garfile;
  const voyageDateTimeObj = {
    departureDate, departureTime, arrivalDate, arrivalTime,
  };
  const validationArr = [];
  garpeople.items.forEach((crew) => {
    const crewLabel = i18n.__('validator_api_uploadgar_people_type_crew');
    const passengerLabel = i18n.__('validator_api_uploadgar_people_type_passenger');
    const peopleType = crew.peopleType === 'Crew' ? crewLabel : passengerLabel;
    const name = i18n.__('validator_api_uploadgar_person_type_person_name', { peopleType, firstName: crew.firstName, lastName: crew.lastName });
    validationArr.push([
      new ValidationRule(validator.isAlpha, '', crew.lastName, `Surname for ${name} must not contain special characters or numbers.`),
    ]);
    validationArr.push([
      new ValidationRule(validator.isAlpha, '', crew.firstName, `Given names for ${name} must not contain special characters or numbers.`),
    ]);
  });

  validationArr.push([
    new ValidationRule(validator.isValidDepAndArrDate, 'departure', voyageDateTimeObj, voyageDateMsg),
  ]);
  validationArr.push([
    new ValidationRule(validator.notEmpty, 'aircraft', registration, registrationMsg),
  ]);
  validationArr.push([
    new ValidationRule(validator.notEmpty, 'manifest', garpeople.items, validateManifestMsg),
  ]);
  if(!frmUpload) {
    validationArr.push([
      new ValidationRule(validator.notEmpty, 'responsiblePerson', responsibleGivenName, responsibleMsg),
    ]);
    
  }
  validationArr.push([
    new ValidationRule(validator.notEmpty, 'customs', visitReason, 'Visit Reason question not answered'),
  ]);
  if(!frmUpload) {
    validationArr.push([
      new ValidationRule(validator.notEmpty, 'intentionValue', intentionValue, customsMsg),
    ]);
  }
  return validationArr;
};
