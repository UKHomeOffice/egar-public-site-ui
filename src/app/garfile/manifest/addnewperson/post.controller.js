const logger = require('../../../../common/utils/logger')(__filename);
const validator = require('../../../../common/utils/validator');
const CookieModel = require('../../../../common/models/Cookie.class');
const garApi = require('../../../../common/services/garApi');
const documenttype = require('../../../../common/seeddata/egar_saved_people_travel_document_type.json');
const persontype = require('../../../../common/seeddata/egar_type_of_saved_person');
const genderchoice = require('../../../../common/seeddata/egar_gender_choice.json');
const validations = require('../validations');
const _ = require('lodash');

module.exports = (req, res) => {
  // Get the ip address
  const ip = req.header('x-forwarded-for');
  logger.debug('In Manifest/Add new Person post controller');

  const cookie = new CookieModel(req);

  const birthdate = `${req.body.dobYear}-${req.body.dobMonth}-${req.body.dobDay}`;
  const expiryDate = `${req.body.expiryYear}-${req.body.expiryMonth}-${req.body.expiryDay}`;
  const person = {
    firstName: req.body['first-name'],
    lastName: req.body['last-name'],
    gender: req.body.gender,
    dateOfBirth: birthdate,
    placeOfBirth: req.body.birthplace,
    nationality: _.toUpper(req.body.nationality),
    peopleType: req.body['person-type'],
    documentNumber: req.body['travel-document-number'],
    documentType: req.body['travel-document-type'],
    issuingState: _.toUpper(req.body['issuing-state']),
    documentExpiryDate: expiryDate,
  };

  validator.validateChains(validations.validations(req))
    .then(() => {
      garApi.patch(cookie.getGarId(), 'Draft', { people: [person] })
        .then((garResponse) => {
          const parsedResponse = JSON.parse(garResponse);
          if (Object.prototype.hasOwnProperty.call(parsedResponse, 'message')) {
            res.render('app/garfile/manifest/addnewperson/index', {
              cookie, persontype, documenttype, genderchoice, errors: [parsedResponse], req, person,
            });
          } else {
            res.redirect('/garfile/manifest');
          }
        });
    })
    .catch((err) => {
      logger.error('There was a problem adding person to saved people');
      logger.error(JSON.stringify(err));
      res.render('app/garfile/manifest/addnewperson/index', {
        cookie, persontype, documenttype, genderchoice, errors: err, req, person,
      });
    });
};
