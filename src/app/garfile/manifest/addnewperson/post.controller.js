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
  };

  return validator
    .validateChains(validations.validations(req))
    .then(() => {
      return dataAccessApi.garApi
        .patch(res.locals.gar.garId, 'Draft', { people: [person] })
        .then((garResponse) => {
          if (Object.prototype.hasOwnProperty.call(garResponse, 'message')) {
            res.render('app/garfile/manifest/addnewperson/index', {
              req,
              cookie,
              person,
              persontype,
              documenttype,
              genderchoice,
              errors: [garResponse],
            });
          } else {
            res.redirect('/garfile/manifest');
          }
        })
        .catch((err) => {
          logger.error('Failed to add person to GAR manifest', {
            garId: cookie.getGarId(),
            errorMessage: err?.message,
            stack: err?.stack,
          });
          res.render('app/garfile/manifest/addnewperson/index', {
            req,
            cookie,
            person,
            persontype,
            documenttype,
            genderchoice,
            errors: [
              err?.type === 'http_error' && typeof err.body?.message === 'string'
                ? err.body
                : { message: 'Error adding a new person. Try again later' },
            ],
          });
        });
    })
    .catch((err) => {
      logger.error('Failed to add person to saved people', { errorMessage: err?.message });
      res.render('app/garfile/manifest/addnewperson/index', {
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
