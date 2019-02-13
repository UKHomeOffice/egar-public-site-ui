const logger = require('../../../../common/utils/logger');
const validator = require('../../../../common/utils/validator');
const validations = require('../validations');
const CookieModel = require('../../../../common/models/Cookie.class');
const persontype = require('../../../../common/seeddata/egar_type_of_saved_person');
const documenttype = require('../../../../common/seeddata/egar_saved_people_travel_document_type.json');
const genderchoice = require('../../../../common/seeddata/egar_gender_choice.json');
const personApi = require('../../../../common/services/personApi');

module.exports = (req, res) => {

  const cookie = new CookieModel(req);

  const firstName = req.body['first-name'];
  const lastName = req.body['last-name'];
  const { nationality } = req.body;
  const { birthplace } = req.body;
  const { gender } = req.body;
  const personType = req.body['person-type'];
  const docNumber = req.body['travel-document-number'];
  const docType = req.body['travel-document-type'];
  const issuingState = req.body['issuing-state'];

  const expiryDate = `${req.body.expiryYear}-${req.body.expiryMonth}-${req.body.expiryDay}`;
  const dob = `${req.body.dobYear}-${req.body.dobMonth}-${req.body.dobDay}`;

  // Validate chains
  validator.validateChains(validations.validations(req))
    .then(() => {
      // call the API to update the data base and then
      personApi.create(
        cookie.getUserDbId(),
        firstName,
        lastName,
        nationality,
        birthplace,
        dob,
        gender,
        docType,
        docNumber,
        expiryDate,
        personType,
        issuingState)
        .then((apiResponse) => {
          const parsedResponse = JSON.parse(apiResponse);
          if (Object.prototype.hasOwnProperty.call(parsedResponse, 'message')) {
            // API returned error
            res.render('app/user/savedpeople/add/index', { cookie, persontype, documenttype, genderchoice, errors: [parsedResponse] });
          } else {
            // Successful
            res.redirect('/user/details');
          }
        })
        .catch((err) => {
          logger.error('There was a problem with adding person to saved people');
          logger.error(err);
          res.render('app/user/savedpeople/add/index', { cookie, persontype, documenttype, genderchoice, errors: [{message: 'There was a problem creating the person.'}] });
        });
    })
    .catch((err) => {
      logger.error('There was a problem with adding person to saved people');
      logger.error(err);
      res.render('app/user/savedpeople/add/index', { cookie, persontype, documenttype, genderchoice, errors: err, req });
    });
};
