const logger = require('../../../../common/utils/logger')(__filename);
const CookieModel = require('../../../../common/models/Cookie.class');
const dataAccessApi = require('../../../../common/services/dataAccessApi');
const documenttype = require('../../../../common/seeddata/egar_saved_people_travel_document_type.json');
const persontype = require('../../../../common/seeddata/egar_type_of_saved_person');
const genderchoice = require('../../../../common/seeddata/egar_gender_choice.json');
const { Manifest } = require('../../../../common/models/Manifest.class');
const validations = require('../../../people/validations');
const validator = require('../../../../common/utils/validator');

module.exports = async (req, res) => {
  const cookie = new CookieModel(req);
  const personId = req.session.editPersonId;

  if (personId === undefined) {
    return res.redirect('/garfile/manifest');
  }

  try {
    const apiResponse = await dataAccessApi.garApi.getPeople(res?.locals?.gar?.garId);
    const parsedResponse = apiResponse.items;
    const person = parsedResponse.find((garPerson) => garPerson.garPeopleId === personId);

    const requestToValidate = Manifest.turnPersonToRequest(person);

    validator
      .validateChains(validations.validations(requestToValidate))
      .then(() => {
        res.render('app/garfile/manifest/editperson/index', {
          cookie,
          persontype,
          documenttype,
          genderchoice,
          req,
          person,
        });
      })
      .catch((err) => {
        logger.error('Validation failed for GAR person', { garId: cookie.getGarId() });
        return res.render('app/garfile/manifest/editperson/index', {
          req,
          cookie,
          person,
          persontype,
          documenttype,
          genderchoice,
          errors: err,
        });
      });
  } catch (err) {
    logger.error('Failed to get GAR person details', {
      personId,
      errorMessage: err?.message,
      stack: err?.stack,
    });
    return res.redirect('/garfile/manifest');
  }
};
