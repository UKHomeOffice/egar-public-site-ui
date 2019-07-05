const CookieModel = require('../../../common/models/Cookie.class');
const logger = require('../../../common/utils/logger')(__filename);
const persontype = require('../../../common/seeddata/egar_type_of_saved_person');
const documenttype = require('../../../common/seeddata/egar_saved_people_travel_document_type.json');
const genderchoice = require('../../../common/seeddata/egar_gender_choice.json');
const personApi = require('../../../common/services/personApi');

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
      if (Object.prototype.hasOwnProperty.call(parsedResponse, 'message')) {
        res.render('app/people/edit/index', {
          cookie, persontype, documenttype, genderchoice, errors: [{ message: 'Failed to get person information' }],
        });
      } else {
        cookie.setEditPerson(parsedResponse);
        res.render('app/people/edit/index', {
          person: parsedResponse, cookie, persontype, documenttype, genderchoice,
        });
      }
    })
    .catch((err) => {
      logger.error('Failed to get org saved person details');
      logger.error(err);
      res.redirect('/people');
    });
};
