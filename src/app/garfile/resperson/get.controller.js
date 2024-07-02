const CookieModel = require('../../../common/models/Cookie.class');
const logger = require('../../../common/utils/logger')(__filename);
const garApi = require('../../../common/services/garApi');
const resPersonApi = require('../../../common/services/resPersonApi');
const fixedBasedOperatorOptions = require('../../../common/seeddata/fixed_based_operator_options.json');
const utils = require('../../../common/utils/utils');

module.exports = async (req, res) => {
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
      const responsiblePerson = await JSON.parse(resPerResponse);
      res.render('app/garfile/resperson/index', { cookie, responsiblePerson, responsiblePersons, fixedBasedOperatorOptions });
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
