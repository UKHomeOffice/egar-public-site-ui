import CookieModel from '../../../common/models/Cookie.class.js';
import loggerFactory from '../../../common/utils/logger.js';
const logger = loggerFactory(import.meta.url);
import garApi from '../../../common/services/garApi.js';
import prohibitedGoodsOptions from '../../../common/seeddata/egar_prohibited_goods_options.json' with { type: 'json' };
import baggageOptions from '../../../common/seeddata/egar_baggage_options.json' with { type: 'json' };
import reasonForVisitOptions from '../../../common/seeddata/egar_visit_reason_options.json' with { type: 'json' };
import freeCirculationOptions from '../../../common/seeddata/egar_craft_eu_free_circulation_options.json' with { type: 'json' };
import intentionValueOptions from '../../../common/seeddata/egar_intention_value_options.json' with { type: 'json' };
import continentalShelfOptions from '../../../common/seeddata/egar_continental_shelf_options.json' with { type: 'json' };

export default (req, res) => {
  logger.info('In get controller for prohibited goods');
  const cookie = new CookieModel(req);

  const garId = cookie.getGarId();

  const context = {
    freeCirculationOptions,
    reasonForVisitOptions,
    prohibitedGoodsOptions,
    baggageOptions,
    intentionValueOptions,
    continentalShelfOptions,
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
