import _ from 'lodash';
import loggerFactory from '../../../../common/utils/logger.js';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const logger = loggerFactory(__filename);
import validator from '../../../../common/utils/validator.js';
import CookieModel from '../../../../common/models/Cookie.class.js';
import garApi from '../../../../common/services/garApi.js';
import documenttype from '../../../../common/seeddata/egar_saved_people_travel_document_type.json' with { type: "json"};
import persontype from '../../../../common/seeddata/egar_type_of_saved_person.json' with { type: "json"};
import genderchoice from '../../../../common/seeddata/egar_gender_choice.json' with { type: "json"};
import validations from '../../../people/validations.js';

export default (req, res) => {
  logger.debug('In Manifest/Add new Person post controller');

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

  validator.validateChains(validations(req))
    .then(() => {
      garApi.patch(cookie.getGarId(), 'Draft', { people: [person] })
        .then((garResponse) => {
          const parsedResponse = JSON.parse(garResponse);
          if (Object.prototype.hasOwnProperty.call(parsedResponse, 'message')) {
            res.render('app/garfile/manifest/addnewperson/index', {
              req, cookie, person, persontype, documenttype, genderchoice, errors: [parsedResponse],
            });
          } else {
            res.redirect('/garfile/manifest');
          }
        }).catch((err) => {
          logger.error('Unexpected error from GAR API when adding new person to the manifest');
          logger.error(err);
          res.render('app/garfile/manifest/addnewperson/index', {
            req, cookie, person, persontype, documenttype, genderchoice, errors: [{ message: 'Error adding a new person. Try again later' }],
          });
        });
    })
    .catch((err) => {
      logger.info('There was a problem adding person to saved people');
      logger.debug(JSON.stringify(err));
      res.render('app/garfile/manifest/addnewperson/index', {
        req, cookie, person, persontype, documenttype, genderchoice, errors: err,
      });
    });
};
