const CookieModel = require('../../../common/models/Cookie.class');
const logger = require('../../../common/utils/logger')(__filename);
const garApi = require('../../../common/services/garApi');
const prohibitedGoodsOptions = require('../../../common/seeddata/egar_prohibited_goods_options');
const reasonForVisitOptions = require('../../../common/seeddata/egar_visit_reason_options.json');

module.exports = (req, res) => {
  logger.info('In get controller for prohibited goods');
  const cookie = new CookieModel(req);

  const garId = cookie.getGarId();

  const context = {
    reasonForVisitOptions,
    prohibitedGoodsOptions,
    cookie,
  };

  garApi.get(garId)
    .then((apiResponse) => {
      const gar = JSON.parse(apiResponse);
      context.gar = gar;
      res.render('app/garfile/customs/index', context);
    })
    .catch(() => {
      logger.error('API failed to retrieve GAR');
      context.errors = [{ message: 'Problems retrieving GAR' }];
      res.render('app/garfile/customs/index', context);
    });
};
