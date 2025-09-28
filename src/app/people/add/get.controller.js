import CookieModel from '../../../common/models/Cookie.class.js';
import loggerFactory from '../../../common/utils/logger.js';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const logger = loggerFactory(__filename);
import persontype from '../../../common/seeddata/egar_type_of_saved_person.json' with { type: "json"};
import documenttype from '../../../common/seeddata/egar_saved_people_travel_document_type.json' with { type: "json"};
import genderchoice from '../../../common/seeddata/egar_gender_choice.json' with { type: "json"};

export default (req, res) => {
  logger.debug('In people / add get controller');

  const cookie = new CookieModel(req);
  res.render('app/people/add/index', {
    cookie, genderchoice, persontype, documenttype,
  });
};
