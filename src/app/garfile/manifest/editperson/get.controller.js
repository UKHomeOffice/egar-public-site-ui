import loggerFactory from '../../../../common/utils/logger.js';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const logger = loggerFactory(__filename);
import CookieModel from '../../../../common/models/Cookie.class.js';
import garApi from '../../../../common/services/garApi.js';
import documenttype from '../../../../common/seeddata/egar_saved_people_travel_document_type.json' with { type: "json"};
import persontype from '../../../../common/seeddata/egar_type_of_saved_person.json' with { type: "json"};
import genderchoice from '../../../../common/seeddata/egar_gender_choice.json' with { type: "json"};
import { Manifest } from '../../../../common/models/Manifest.class.js';
import validations from '../../../people/validations.js';
import validator from '../../../../common/utils/validator.js';

export default async (req, res) => {
  const cookie = new CookieModel(req);
  logger.debug('In garfile / manifest / edit person get controller');
  const personId = req.session.editPersonId;

  if (personId === undefined) {
    return res.redirect('/garfile/manifest');
  }

  try {
    const apiResponse = await garApi.getPeople(cookie.getGarId());
    const parsedResponse = JSON.parse(apiResponse).items;
    const person = parsedResponse.find((garPerson) => garPerson.garPeopleId === personId);

    const requestToValidate = Manifest.turnPersonToRequest(person);

    validator.validateChains(validations(requestToValidate))
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
