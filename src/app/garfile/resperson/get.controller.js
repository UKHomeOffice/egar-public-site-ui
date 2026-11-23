const CookieModel = require('../../../common/models/Cookie.class');
const logger = require('../../../common/utils/logger')(__filename);
const { garApi, resPersonApi } = require('../../../common/services/dataAccessApi');
const fixedBasedOperatorOptions = require('../../../common/seeddata/fixed_based_operator_options.json');
const utils = require('../../../common/utils/utils');

module.exports = async (req, res) => {
  const cookie = new CookieModel(req);
  const garId = res.locals.gar.garId;
  const context = {
    fixedBasedOperatorOptions,
    cookie,
  };
  try {
    const gar = await garApi.get(garId);
    const responsiblePerson = utils.getResponsiblePersonFromGar(gar);
    const responsiblePersons = await resPersonApi.getResPersons(cookie.getUserDbId());
    const userId = cookie.getUserDbId();
    if (req.query.resPersonId) {
      const responsible_person = await resPersonApi.getResPersonDetails(userId, req.query.resPersonId);
      res.render('app/garfile/resperson/index', {
        cookie,
        responsiblePerson: responsible_person,
        responsiblePersons,
        fixedBasedOperatorOptions,
      });
    } else {
      res.render('app/garfile/resperson/index', {
        cookie,
        responsiblePerson,
        responsiblePersons,
        fixedBasedOperatorOptions,
      });
    }
  } catch (err) {
    logger.error('Failed to retrieve GAR', { garId, errorMessage: err?.message, stack: err?.stack });
    const payload = {
      ...context,
      errors: [
        {
          message: 'Problem retrieving GAR',
        },
      ],
    };
    res.render('app/garfile/resperson/index', payload);
  }
};
