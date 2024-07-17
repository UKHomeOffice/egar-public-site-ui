const _ = require('lodash');

const logger = require('../../../../common/utils/logger')(__filename);
const validator = require('../../../../common/utils/validator');
const CookieModel = require('../../../../common/models/Cookie.class');
const garApi = require('../../../../common/services/garApi');
const documenttype = require('../../../../common/seeddata/egar_saved_people_travel_document_type.json');
const persontype = require('../../../../common/seeddata/egar_type_of_saved_person');
const genderchoice = require('../../../../common/seeddata/egar_gender_choice.json');
const validations = require('../../../people/validations');
const { isIsleOfManFlight } = require('../../../../common/utils/utils');

module.exports = (req, res) => {
  logger.debug('In Manifest/Add new Person post controller');

  const cookie = new CookieModel(req);
  const infoType = req.query.infoType;
  const { departureCountryCode } = cookie.getGarDepartureVoyage();
  const { arrivalCountryCode } = cookie.getGarArrivalVoyage();

  const birthdate = `${req.body.dobYear}-${req.body.dobMonth}-${req.body.dobDay}`;
  const expiryDate = `${req.body.expiryYear}-${req.body.expiryMonth}-${req.body.expiryDay}`;

  const passengerInfo = {
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    gender: req.body.gender,
    dateOfBirth: birthdate,
    placeOfBirth: req.body.birthplace,
    nationality: _.toUpper(req.body.nationality),
    peopleType: req.body.personType,
   
  };

  const travelDocumentInfo =  {
    documentNumber: req.body.travelDocumentNumber,
    documentType: req.body.travelDocumentType,
    documentDesc: req.body.travelDocumentOther,
    issuingState: _.toUpper(req.body.issuingState),
    documentExpiryDate: expiryDate,
  };

  const person = {
    ...passengerInfo,
    ...travelDocumentInfo,
  }
  const isleOfManFlightUKPassenger = isIsleOfManFlight(
    departureCountryCode, arrivalCountryCode
  ) && passengerInfo.nationality === "GBR"

  validator.validateChains(validations.validations(req, infoType))
    .then(() => {
      if (infoType === "PASSENGER" && !isleOfManFlightUKPassenger) {
        cookie.setAddPerson(passengerInfo)
        res.render('app/garfile/manifest/addnewperson/index', {
          req, cookie, person, persontype, documenttype, genderchoice, errors: [parsedResponse], infoType: "TRAVEL"
        });

        return;
      } else {
        isleOfManFlightUKPassenger ? cookie.setAddPerson(passengerInfo) : cookie.setAddPerson(travelDocumentInfo);
        const addPerson = cookie.getAddPerson();
        garApi.patch(cookie.getGarId(), 'Draft', { people: [addPerson] })
          .then((garResponse) => {
            const parsedResponse = JSON.parse(garResponse);
            if (Object.prototype.hasOwnProperty.call(parsedResponse, 'message')) {
              res.render('app/garfile/manifest/addnewperson/index', {
                req, cookie, person, persontype, documenttype, genderchoice, errors: [parsedResponse], infoType
              });
            } else {
              this.session.infoType = infoType;
              res.redirect('/garfile/manifest');
            }
          }).catch((err) => {
            logger.error('Unexpected error from GAR API when adding new person to the manifest');
            logger.error(err);
            res.render('app/garfile/manifest/addnewperson/index', {
              req, cookie, person, persontype, documenttype, genderchoice, infoType, errors: [{ message: 'Error adding a new person. Try again later' }],
            });
          });
      }
    })
    .catch((err) => {
      logger.info('There was a problem adding person to saved people');
      logger.debug(JSON.stringify(err));
      res.render('app/garfile/manifest/addnewperson/index', {
        req, cookie, person, persontype, documenttype, genderchoice, errors: err, infoType,
      });
    });
};
