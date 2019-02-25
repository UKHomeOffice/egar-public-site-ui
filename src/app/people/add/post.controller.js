const logger = require('../../../common/utils/logger');
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
    nationality: req.body.nationality,
    birthplace: req.body.birthplace,
    gender: req.body.gender,
    personType: req.body['person-type'],
    docNumber: req.body['travel-document-number'],
    docType: req.body['travel-document-type'],
    issuingState: req.body['issuing-state'],
    expiryDate: `${req.body.expiryYear}-${req.body.expiryMonth}-${req.body.expiryDay}`,
    dob: `${req.body.dobYear}-${req.body.dobMonth}-${req.body.dobDay}`,
  };

  // Validate chains
  validator.validateChains(validations.validations(req))
    .then(() => {
      // call the API to update the data base and then
      personApi.create(
        cookie.getUserDbId(),
        person.firstName,
        person.lastName,
        person.nationality,
        person.birthplace,
        person.dob,
        person.gender,
        person.docType,
        person.docNumber,
        person.expiryDate,
        person.personType,
        person.issuingState)
        .then((apiResponse) => {
          const parsedResponse = JSON.parse(apiResponse);
          if (Object.prototype.hasOwnProperty.call(parsedResponse, 'message')) {
            // API returned error
            res.render('app/people/add/index', { cookie, persontype, documenttype, genderchoice, errors: [parsedResponse] });
          } else {
            // Successful
            res.redirect('/people');
          }
        })
        .catch((err) => {
          logger.error('There was a problem adding person to saved people');
          logger.error(err);
          res.render('app/people/add/index', { cookie, persontype, documenttype, genderchoice, errors: [{ message: 'There was a problem creating the person.' }] });
        });
    })
    .catch((err) => {
      logger.error(err);
      res.render('app/people/add/index', { person: req.body, cookie, persontype, documenttype, genderchoice, errors: err, req });
    });
};
