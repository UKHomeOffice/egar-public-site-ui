import CookieModel from '../../../../common/models/Cookie.class.js';
import loggerFactory from '../../../../common/utils/logger.js';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const logger = loggerFactory(__filename);
import persontype from '../../../../common/seeddata/egar_type_of_saved_person.json' with { type: "json"};
import documenttype from '../../../../common/seeddata/egar_saved_people_travel_document_type.json' with { type: "json"};
import genderchoice from '../../../../common/seeddata/egar_gender_choice.json' with { type: "json"};
import personApi from '../../../../common/services/personApi.js';
import transformer from '../../../../common/utils/transformers.js';

export default (req, res) => {
  const cookie = new CookieModel(req);
  logger.debug('In garfile / manifest / addperson post controller');

  const personId = req.session.addPersonId;
  let person = {};

  if (personId === undefined) {
    res.render('app/garfile/manifest/addnewperson/index', {
      cookie, persontype, documenttype, genderchoice, req, person,
    });
    return;
  }

  personApi.getPeople(cookie.getUserDbId(), 'individual')
    .then((apiResponse) => {
      const parsedResponse = JSON.parse(apiResponse);
      person = parsedResponse.find(element => element.personId === personId);
      delete req.session.addPersonId;
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
