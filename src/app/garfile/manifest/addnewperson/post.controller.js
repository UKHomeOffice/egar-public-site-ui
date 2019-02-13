const logger = require('../../../../common/utils/logger');
const validator = require('../../../../common/utils/validator');
const CookieModel = require('../../../../common/models/Cookie.class');
const garApi = require('../../../../common/services/garApi');
const traveldocumenttype = require('../../../../common/seeddata/egar_saved_people_travel_document_type.json');
const travepersontype = require('../../../../common/seeddata/egar_type_of_saved_person');
const genderchoice = require('../../../../common/seeddata/egar_gender_choice.json');
const validations = require('../validations');

module.exports = (req, res) => {
  // Get the ip address
  const ip = req.header('x-forwarded-for');
  logger.debug('In Manifest/Add new Person post controller');

  const cookie = new CookieModel(req);

  const birthdate = `${req.body.dobyear}-${req.body.dobmonth}-${req.body.dobday}`;
  const expiryDate = `${req.body.expyear}-${req.body.expmonth}-${req.body.expday}`;
  const personDetails = {
    firstName: req.body.first_name,
    lastName: req.body.surname,
    gender: req.body.gender,
    dateOfBirth: birthdate,
    placeOfBirth: req.body.placeOfBirth,
    nationality: req.body.nationality,
    peopleType: req.body.persontype,
    documentNumber: req.body.documentNumber,
    documentType: req.body.documenttype,
    issuingState: req.body.issuingState,
    documentExpiryDate: expiryDate,
  };
  validator.validateChains(validations.validations(req))
    .then(() => {
      garApi.patch(cookie.getGarId(), 'Draft', { people: [personDetails] })
        .then((garResponse) => {
          const parsedResponse = JSON.parse(garResponse);
          if (Object.prototype.hasOwnProperty.call(parsedResponse, 'message')) {
            res.render('app/garfile/manifest/addnewperson/index', {
              cookie, travepersontype, traveldocumenttype, genderchoice, errors: [parsedResponse], req, personDetails,
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
        cookie, travepersontype, traveldocumenttype, genderchoice, errors: err, req, personDetails,
      });
    });
};
