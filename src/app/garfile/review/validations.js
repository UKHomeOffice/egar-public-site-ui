/* eslint-disable no-underscore-dangle */

const i18n = require('i18n');
const ValidationRule = require('../../../common/models/ValidationRule.class');
const validator = require('../../../common/utils/validator');

const registrationMsg = 'Aircraft registration must be completed';
const responsibleMsg = 'Responsible person details must be completed';
const customsMsg = 'Customs Declaration question not answered';

module.exports.validations = (garfile, garpeople, frmUpload = false) => {
  const voyageDateMsg = i18n.__('validator_msg_voyage_dates');
  const {
    departureDate, departureTime, arrivalDate, arrivalTime, registration, responsibleGivenName, prohibitedGoods, baggage, visitReason, intentionValue,
  } = garfile;
  const voyageDateTimeObj = {
    departureDate, departureTime, arrivalDate, arrivalTime,
  };
  const validationArr = [];

  validationArr.push([
    new ValidationRule(validator.isValidDepAndArrDate, 'departure', voyageDateTimeObj, voyageDateMsg),
  ]);
  validationArr.push([
    new ValidationRule(validator.notEmpty, 'aircraft', registration, registrationMsg),
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
