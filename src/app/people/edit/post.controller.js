import _ from 'lodash';
import loggerFactory from '../../../common/utils/logger.js';
const logger = loggerFactory(import.meta.url);
import validator from '../../../common/utils/validator.js';
import validations from '../validations.js';
import CookieModel from '../../../common/models/Cookie.class.js';
import persontype from '../../../common/seeddata/egar_type_of_saved_person.json' with { type: "json"};
import documenttype from '../../../common/seeddata/egar_saved_people_travel_document_type.json' with { type: "json"};
import genderchoice from '../../../common/seeddata/egar_gender_choice.json' with { type: "json"};
import personApi from '../../../common/services/personApi.js';

export default (req, res) => {
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

  logger.info(person.documentType);
  logger.info(person.documentDesc);

  cookie.updateEditPerson(person);

  // Validate chains
  validator.validateChains(validations(req))
    .then(() => {
      // call the API to update the data base and then
      personApi.update(
        cookie.getUserDbId(),
        cookie.getEditPerson().personId,
        person,
      ).then((apiResponse) => {
        const parsedResponse = JSON.parse(apiResponse);
        if (Object.prototype.hasOwnProperty.call(parsedResponse, 'message')) {
          // API returned error
          res.render('app/people/edit/index', {
            cookie, persontype, documenttype, genderchoice, errors: [parsedResponse],
          });
        } else {
          // Successful
          res.redirect('/people');
        }
      }).catch((err) => {
        logger.error('There was a problem with calling the API');
        logger.error(err);
        res.render('app/people/edit/index', {
          cookie, req, persontype, documenttype, genderchoice, errors: [{ message: 'An error occurred. Please try again' }],
        });
      });
    })
    .catch((err) => {
      logger.error('There was a problem with adding person to saved people');
      logger.error(JSON.stringify(err));
      res.render('app/people/edit/index', {
        cookie, req, persontype, documenttype, genderchoice, errors: err,
      });
    });
};
