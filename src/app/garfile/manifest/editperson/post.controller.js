const _ = require('lodash');

const logger = require('../../../../common/utils/logger')(__filename);
const validator = require('../../../../common/utils/validator');
const CookieModel = require('../../../../common/models/Cookie.class');
const dataAccessApi = require('../../../../common/services/dataAccessApi');
const documenttype = require('../../../../common/seeddata/egar_saved_people_travel_document_type.json');
const persontype = require('../../../../common/seeddata/egar_type_of_saved_person');
const genderchoice = require('../../../../common/seeddata/egar_gender_choice.json');
const validations = require('../../../people/validations');

module.exports = (req, res) => {
  const cookie = new CookieModel(req);

  const birthdate = `${req.body.dobYear}-${req.body.dobMonth}-${req.body.dobDay}`;
  const expiryDate = `${req.body.expiryYear}-${req.body.expiryMonth}-${req.body.expiryDay}`;

  const person = {
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    gender: req.body.gender,
    dateOfBirth: birthdate,
    placeOfBirth: req.body.birthplace,
    nationality: _.toUpper(req.body.nationality),
    peopleType: req.body.personType,
    documentNumber: req.body.travelDocumentNumber,
    documentType: req.body.travelDocumentType,
    documentDesc: req.body.travelDocumentOther,
    issuingState: _.toUpper(req.body.issuingState),
    documentExpiryDate: expiryDate,
    garPeopleId: req.body.garPeopleId,
  };

  const errMsg = { message: 'Failed to update GAR person. Try again' };

  return validator
    .validateChains(validations.validations(req))
    .then(() => {
      return dataAccessApi.garApi
        .updateGarPerson(res?.locals?.gar?.garId, person)
        .then((apiResponse) => {
          if (Object.prototype.hasOwnProperty.call(apiResponse, 'message')) {
            return res.render('app/garfile/manifest/editperson/index', {
              req,
              cookie,
              person,
              persontype,
              documenttype,
              genderchoice,
              errors: [apiResponse],
            });
          }
          return res.redirect('/garfile/manifest');
        })
        .catch((err) => {
          logger.error('Failed to update GAR person', {
            garPeopleId: req.body.garPeopleId,
            errorMessage: err?.message,
            stack: err?.stack,
          });
          res.render('app/garfile/manifest/editperson/index', {
            req,
            cookie,
            person,
            persontype,
            documenttype,
            genderchoice,
            errors: [err?.type === 'http_error' && typeof err.body?.message === 'string' ? err.body : errMsg],
          });
        });
    })
    .catch((err) => {
      res.render('app/garfile/manifest/editperson/index', {
        req,
        cookie,
        person,
        persontype,
        documenttype,
        genderchoice,
        errors: err,
      });
    });
};
