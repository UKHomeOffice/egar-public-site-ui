import CookieModel from '../../../common/models/Cookie.class.js';
import loggerFactory from '../../../common/utils/logger.js';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const logger = loggerFactory(__filename);
import persontype from '../../../common/seeddata/egar_type_of_saved_person.json' with { type: "json"};
import documenttype from '../../../common/seeddata/egar_saved_people_travel_document_type.json' with { type: "json"};
import genderchoice from '../../../common/seeddata/egar_gender_choice.json' with { type: "json"};
import personApi from '../../../common/services/personApi.js';
import { Manifest } from '../../../common/models/Manifest.class.js';
import validations from '../validations.js';
import validator from '../../../common/utils/validator.js';


export default async (req, res) => {
  logger.debug('In people / edit get controller');
  const cookie = new CookieModel(req);

  const id = req.session.editPersonId;

  if (id === undefined) {
    res.redirect('/people');
    return;
  }

  await personApi.getDetails(cookie.getUserDbId(), id)
    .then((apiResponse) => {
      const parsedResponse = JSON.parse(apiResponse);

      if (Object.prototype.hasOwnProperty.call(parsedResponse, 'message')) {
        return res.render('app/people/edit/index', {
          cookie, persontype, documenttype, genderchoice, errors: [{ message: 'Failed to get person information' }],
        });
      } 

      const requestToValidate = Manifest.turnPersonToRequest(parsedResponse);
      cookie.setEditPerson(parsedResponse);

      validator.validateChains(validations(requestToValidate))
        .then(() => {
          return res.render('app/people/edit/index', {
            cookie, persontype, documenttype, genderchoice, person: parsedResponse,
          });
        })
        .catch((err) => {
          logger.error(`gar id (${cookie.getGarId()}): ${JSON.stringify(err)}`);
          return res.render('app/people/edit/index', {
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
