const CookieModel = require('../../../../common/models/Cookie.class');
const logger = require('../../../../common/utils/logger')(__filename);
const persontype = require('../../../../common/seeddata/egar_type_of_saved_person');
const documenttype = require('../../../../common/seeddata/egar_saved_people_travel_document_type.json');
const genderchoice = require('../../../../common/seeddata/egar_gender_choice.json');
const personApi = require('../../../../common/services/personApi');
const transformer = require('../../../../common/utils/transformers');

module.exports = (req, res) => {
  const cookie = new CookieModel(req);
  logger.debug('In garfile / manifest / addperson post controller');
  const personId = req.session.addPersonId;
  let person = {};

  if (personId === undefined) {
    return res.render('app/garfile/manifest/addnewperson/index', {
      cookie, persontype, documenttype, genderchoice, req, person,
    });
  }

  personApi.getPeople(cookie.getUserDbId(), 'individual')
    .then((apiResponse) => {
      const parsedResponse = JSON.parse(apiResponse);
      person = parsedResponse.find((person) => {
        return person.personId === personId;
      });
      req.session.addPersonId = undefined;
      person = transformer.transformPerson(person);
      res.render('app/garfile/manifest/addnewperson/index', {
        cookie, persontype, documenttype, genderchoice, req, person,
      });
    })
    .catch((err) => {
      logger.error('Failed to get person details');
      logger.error(err);
      return res.redirect('/garfile/manifest');
    });
};
