const logger = require('../../../common/utils/logger');
const validations = require('./validations');
const validator = require('../../../common/utils/validator');
const CookieModel = require('../../../common/models/Cookie.class');
const garApi = require('../../../common/services/garApi');
const prohibitedGoodsOptions = require('../../../common/seeddata/egar_prohibited_goods_options');
const reasonForVisitOptions = require('../../../common/seeddata/egar_visit_reason_options.json');
const freeCirculationOptions = require('../../../common/seeddata/egar_craft_eu_free_circulation_options.json');

module.exports = (req, res) => {

  const cookie = new CookieModel(req);

  const customs = {
    prohibitedGoods: req.body.prohibitedGoods,
    freeCirculation: req.body.freeCirculation,
    visitReason: req.body.visitReason,
  };

  const context = {
    freeCirculationOptions,
    reasonForVisitOptions,
    prohibitedGoodsOptions,
    cookie,
    gar: customs,
  };

  const { buttonClicked } = req.body;

  validator.validateChains(validations.validations(req))
    .then(() => {
      garApi.patch(cookie.getGarId(), cookie.getGarStatus(), customs)
        .then((apiResponse) => {
          const parsedResponse = JSON.parse(apiResponse);
          if (parsedResponse.hasOwnProperty('message')) {
            context.errors = [parsedResponse];
            res.render('app/garfile/customs/index', context);
          } else {
            return buttonClicked === 'Save and continue' ? res.redirect('/garfile/supportingdocuments') : res.redirect('/home');
          }
        })
        .catch((err) => {
          logger.error('API failed to update GAR');
          logger.error(err);
          context.errors = [{ message: 'Failed to save customs information. Try again' }];
          res.render('app/garfile/customs/index', context);
        });
    })
    .catch((validationErrs) => {
      logger.debug('Failed validations');
      context.errors = validationErrs;
      res.render('app/garfile/customs/index', context);
    });
};
