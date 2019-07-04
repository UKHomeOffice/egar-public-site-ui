const _ = require('lodash');
const logger = require('../../../common/utils/logger')(__filename);
const validator = require('../../../common/utils/validator');
const validations = require('../validations');
const CookieModel = require('../../../common/models/Cookie.class');
const persontype = require('../../../common/seeddata/egar_type_of_saved_person');
const documenttype = require('../../../common/seeddata/egar_saved_people_travel_document_type.json');
const genderchoice = require('../../../common/seeddata/egar_gender_choice.json');
const personApi = require('../../../common/services/personApi');

module.exports = (req, res) => {
  const cookie = new CookieModel(req);

  const person = {
    firstName: req.body['first-name'],
    lastName: req.body['last-name'],
    nationality: _.toUpper(req.body.nationality),
    placeOfBirth: req.body.birthplace,
    gender: req.body.gender,
    peopleType: req.body['person-type'],
    documentNumber: req.body['travel-document-number'],
    documentType: req.body['travel-document-type'],
    issuingState: _.toUpper(req.body['issuing-state']),
    documentExpiryDate: `${req.body.expiryYear}-${req.body.expiryMonth}-${req.body.expiryDay}`,
    dateOfBirth: `${req.body.dobYear}-${req.body.dobMonth}-${req.body.dobDay}`,
  };

  cookie.updateEditPerson(person);

  // Validate chains
  validator.validateChains(validations.validations(req))
    .then(() => {
      // call the API to update the data base and then
      personApi.update(
        cookie.getUserDbId(),
        cookie.getEditPerson().personId,
        person.firstName,
        person.lastName,
        person.nationality,
        person.placeOfBirth,
        person.dateOfBirth,
        person.gender,
        person.documentType,
        person.documentNumber,
        person.documentExpiryDate,
        person.peopleType,
        person.issuingState,
      ).then((apiResponse) => {
        const parsedResponse = JSON.parse(apiResponse);
        if (Object.prototype.hasOwnProperty.call(parsedResponse, 'message')) {
          res.render('app/people/edit/index', {
            cookie, persontype, documenttype, genderchoice, errors: [parsedResponse],
          });
          // API returned error
        } else {
          // Successful
          res.redirect('/people');
        }
      });
    })
    .catch((err) => {
      logger.error('There was a problem with adding person to saved people');
      logger.error(err);
      res.render('app/people/edit/index', {
        cookie, req, persontype, documenttype, genderchoice, errors: err,
      });
    });
};
