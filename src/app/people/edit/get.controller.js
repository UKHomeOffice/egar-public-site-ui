const CookieModel = require('../../../common/models/Cookie.class');
const logger = require('../../../common/utils/logger')(__filename);
const persontype = require('../../../common/seeddata/egar_type_of_saved_person');
const documenttype = require('../../../common/seeddata/egar_saved_people_travel_document_type.json');
const genderchoice = require('../../../common/seeddata/egar_gender_choice.json');
const personApi = require('../../../common/services/personApi');
const { Manifest } = require('../../../common/models/Manifest.class');
const validations = require('../validations');
const validator = require('../../../common/utils/validator');


module.exports = (req, res) => {
  logger.debug('In people / edit get controller');
  const cookie = new CookieModel(req);

  const id = req.session.editPersonId;

  if (id === undefined) {
    res.redirect('/people');
    return;
  }

  personApi.getDetails(cookie.getUserDbId(), id)
    .then((apiResponse) => {
      const parsedResponse = JSON.parse(apiResponse);

      const requestToValidate = Manifest.turnPersonToRequest(parsedResponse);

      validator.validateChains(validations.validations(requestToValidate))
        .then(() => {
          if (Object.prototype.hasOwnProperty.call(parsedResponse, 'message')) {
            res.render('app/people/edit/index', {
              cookie, persontype, documenttype, genderchoice, errors: [{ message: 'Failed to get person information' }],
            });
          } else {
            cookie.setEditPerson(parsedResponse);
            res.render('app/people/edit/index', {
              cookie, persontype, documenttype, genderchoice, person: parsedResponse,
            });
          }
        })
        .catch((err) => {
          logger.error(`gar id (${cookie.getGarId()}): ${err}`);
          return res.render('app/garfile/manifest/editperson/index', {
            req, cookie, person: parsedResponse, persontype, documenttype, genderchoice, errors: err,
          });
        });
    })
    .catch((err) => {
      logger.error('Failed to get saved person details');
      logger.error(err);
      res.redirect('/people');
    });
};
