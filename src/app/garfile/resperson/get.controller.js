import CookieModel from '../../../common/models/Cookie.class.js';
import loggerFactory from '../../../common/utils/logger.js';
const logger = loggerFactory(import.meta.url);
import garApi from '../../../common/services/garApi.js';
import resPersonApi from '../../../common/services/resPersonApi.js';
import fixedBasedOperatorOptions from '../../../common/seeddata/fixed_based_operator_options.json' with { type: "json"};
import utils from '../../../common/utils/utils.js';

export default async (req, res) => {
  logger.debug('In garfile/responsible person get controller');
  const cookie = new CookieModel(req);
  const garId = cookie.getGarId();
  const context = {
    fixedBasedOperatorOptions,
    cookie,
  };
  try {
    const response = await garApi.get(garId);
    const gar = await JSON.parse(response);
    const responsiblePerson = utils.getResponsiblePersonFromGar(gar);
    const resPersonsResponse = await resPersonApi.getResPersons(cookie.getUserDbId());
    const responsiblePersons = await JSON.parse(resPersonsResponse);
    const userId = cookie.getUserDbId();
    if(req.query.resPersonId) {
      const resPerResponse = await resPersonApi.getResPersonDetails(userId, req.query.resPersonId);
      const responsible_person = await JSON.parse(resPerResponse);
      res.render('app/garfile/resperson/index', { cookie, responsiblePerson:responsible_person, responsiblePersons, fixedBasedOperatorOptions });
    } else {
      res.render('app/garfile/resperson/index', { cookie, responsiblePerson, responsiblePersons, fixedBasedOperatorOptions });
    }
  } catch(err) {
    logger.error('API failed to retrieve GAR');
    logger.error(err);
    res.render('app/garfile/resperson/index', context, {
      errors: [{
        message: 'Problem retrieving GAR',
      }],
    });
  };
};
