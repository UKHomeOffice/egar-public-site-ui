const _ = require('lodash');

const logger = require('../../../../common/utils/logger')(__filename);
const validator = require('../../../../common/utils/validator');
const CookieModel = require('../../../../common/models/Cookie.class');
const garApi = require('../../../../common/services/garApi');
const documenttype = require('../../../../common/seeddata/egar_saved_people_travel_document_type.json');
const persontype = require('../../../../common/seeddata/egar_type_of_saved_person');
const genderchoice = require('../../../../common/seeddata/egar_gender_choice.json');
const validations = require('../../../people/validations');
const { getPersonFromRequest } = require('../../../../common/utils/utils');

module.exports = (req, res) => {
  logger.debug('In Manifest/Edit Person post controller');

  const cookie = new CookieModel(req);

  const birthdate = `${req.body.dobYear}-${req.body.dobMonth}-${req.body.dobDay}`;
  const expiryDate = `${req.body.expiryYear}-${req.body.expiryMonth}-${req.body.expiryDay}`;

  const person = getPersonFromRequest(req, cookie.getIsIsleOfManFlight());
  person.garPeopleId = req.body.garPeopleId;


  const errMsg = { message: 'Failed to update GAR person. Try again' };

  validator.validateChains(validations.validations(req))
    .then(() => {
      garApi.updateGarPerson(cookie.getGarId(), person)
        .then((apiResponse) => {
          const parsedResponse = JSON.parse(apiResponse);
          if (Object.prototype.hasOwnProperty.call(parsedResponse, 'message')) {
            return res.render('app/garfile/manifest/editperson/index', {
              req, cookie, person, persontype, documenttype, genderchoice, errors: [parsedResponse],
            });
          }
          return res.redirect('/garfile/manifest');
        })
        .catch((err) => {
          logger.error(err);
          res.render('app/garfile/manifest/editperson/index', {
            req, cookie, person, persontype, documenttype, genderchoice, errors: [errMsg],
          });
        });
    })
    .catch((err) => {
      res.render('app/garfile/manifest/editperson/index', {
        req, cookie, person, persontype, documenttype, genderchoice, errors: err,
      });
    });
};
