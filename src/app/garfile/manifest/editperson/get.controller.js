const logger = require('../../../../common/utils/logger')(__filename);
const CookieModel = require('../../../../common/models/Cookie.class');
const garApi = require('../../../../common/services/garApi');
const documenttype = require('../../../../common/seeddata/egar_saved_people_travel_document_type.json');
const persontype = require('../../../../common/seeddata/egar_type_of_saved_person');
const genderchoice = require('../../../../common/seeddata/egar_gender_choice.json');
const { Manifest } = require('../../../../common/models/Manifest.class');
const validations = require('../../../people/validations');
const validator = require('../../../../common/utils/validator');

module.exports = async (req, res) => {
  const cookie = new CookieModel(req);
  logger.debug('In garfile / manifest / edit person get controller');
  const personId = req.session.editPersonId;

  if (personId === undefined) {
    return res.redirect('/garfile/manifest');
  }

  try {
    const apiResponse = await garApi.getPeople(cookie.getGarId());
    const parsedResponse = JSON.parse(apiResponse).items;
    const person = parsedResponse.find((garPerson) => {
      return garPerson.garPeopleId === personId;
    });

    logger.info(JSON.stringify(person));
    const requestToValidate = Manifest.turnPersonToRequest(person);

    validator.validateChains(validations.validations(requestToValidate))
    .then(() => {
      res.render('app/garfile/manifest/editperson/index', {
        cookie, persontype, documenttype, genderchoice, req, person,
      });
    })
    .catch((err) => {
      logger.error(`gar id (${cookie.getGarId()}): ${err}`);
      return res.render('app/garfile/manifest/editperson/index', {
        req, cookie, person, persontype, documenttype, genderchoice, errors: err,
      });
    });
  } catch(err) {
    logger.error('Failed to get garperson details');
    logger.error(err);
    return res.redirect('/garfile/manifest');
  }
};
