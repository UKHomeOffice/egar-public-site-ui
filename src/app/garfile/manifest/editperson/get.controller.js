const logger = require('../../../../common/utils/logger')(__filename);
const CookieModel = require('../../../../common/models/Cookie.class');
const garApi = require('../../../../common/services/garApi');
const traveldocumenttype = require('../../../../common/seeddata/egar_saved_people_travel_document_type.json');
const travepersontype = require('../../../../common/seeddata/egar_type_of_saved_person');
const genderchoice = require('../../../../common/seeddata/egar_gender_choice.json');

module.exports = (req, res) => {
  const cookie = new CookieModel(req);
  logger.debug('In garfile / manifest post controller');
  const personId = req.session.editPersonId;

  if (personId === undefined) {
    return res.redirect('/garfile/manifest');
  }

  garApi.getPeople(cookie.getGarId())
    .then((apiResponse) => {
      const parsedResponse = JSON.parse(apiResponse).items;
      const personDetails = parsedResponse.find((garPerson) => {
        return garPerson.garPeopleId === personId;
      });
      res.render('app/garfile/manifest/editperson/index', {
        cookie, travepersontype, traveldocumenttype, genderchoice, req, personDetails,
      });
    })
    .catch((err) => {
      logger.error('Failed to get garperson details');
      logger.error(err);
      return res.redirect('/garfile/manifest');
    });
};
