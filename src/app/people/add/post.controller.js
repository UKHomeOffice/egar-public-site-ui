const _ = require('lodash');
const logger = require('../../../common/utils/logger')(__filename);
const validator = require('../../../common/utils/validator');
const validations = require('../validations');
const CookieModel = require('../../../common/models/Cookie.class');
const persontype = require('../../../common/seeddata/egar_type_of_saved_person');
const documenttype = require('../../../common/seeddata/egar_saved_people_travel_document_type.json');
const genderchoice = require('../../../common/seeddata/egar_gender_choice.json');
const dataAccessApi = require('../../../common/services/dataAccessApi');

module.exports = (req, res) => {
  const cookie = new CookieModel(req);

  const person = {
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    nationality: _.toUpper(req.body.nationality),
    placeOfBirth: req.body.birthplace,
    gender: req.body.gender,
    peopleType: req.body.personType,
    documentNumber: req.body.travelDocumentNumber,
    documentType: req.body.travelDocumentType,
    issuingState: _.toUpper(req.body.issuingState),
    documentExpiryDate: `${req.body.expiryYear}-${req.body.expiryMonth}-${req.body.expiryDay}`,
    dateOfBirth: `${req.body.dobYear}-${req.body.dobMonth}-${req.body.dobDay}`,
    documentDesc: req.body.travelDocumentOther,
  };

  // Validate chains
  return validator
    .validateChains(validations.validations(req))
    .then(() => {
      // call the API to update the database and then
      return dataAccessApi.personApi
        .create(cookie.getUserDbId(), { people: [person] })
        .then((apiResponse) => {
          if (Object.prototype.hasOwnProperty.call(apiResponse, 'message')) {
            // API returned error
            res.render('app/people/add/index', {
              cookie,
              persontype,
              documenttype,
              genderchoice,
              errors: [apiResponse],
            });
          } else {
            // Successful
            res.redirect('/people');
          }
        })
        .catch((err) => {
          logger.error('Failed to add person to saved people', { errorMessage: err?.message, stack: err?.stack });
          res.render('app/people/add/index', {
            cookie,
            persontype,
            documenttype,
            genderchoice,
            errors: [
              err?.type === 'http_error' && err.body && typeof err.body.message === 'string'
                ? err.body
                : { message: 'There was a problem creating the person. Please try again' },
            ],
          });
        });
    })
    .catch((err) => {
      logger.warn('Person validation failed');
      res.render('app/people/add/index', {
        cookie,
        req,
        persontype,
        documenttype,
        genderchoice,
        person: req.body,
        errors: err,
      });
    });
};
