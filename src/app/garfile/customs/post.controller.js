const logger = require('../../../common/utils/logger')(__filename);
const validations = require('./validations');
const validator = require('../../../common/utils/validator');
const CookieModel = require('../../../common/models/Cookie.class');
const garApi = require('../../../common/services/garApi');
const prohibitedGoodsOptions = require('../../../common/seeddata/egar_prohibited_goods_options');
const reasonForVisitOptions = require('../../../common/seeddata/egar_visit_reason_options.json');
const freeCirculationOptions = require('../../../common/seeddata/egar_craft_eu_free_circulation_options.json');

module.exports = (req, res) => {
  const cookie = new CookieModel(req);

  if (req.body.goodsDeclaration) {
    req.body.goodsDeclaration = req.body.goodsDeclaration.trim();
  } else {
    req.body.goodsDeclaration = '';
  }

  const customs = {
    prohibitedGoods: req.body.prohibitedGoods,
    goodsDeclaration: (req.body.prohibitedGoods === 'Yes' ? req.body.goodsDeclaration : ''),
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
          if (Object.prototype.hasOwnProperty.call(parsedResponse, 'message')) {
            context.errors = [parsedResponse];
            res.render('app/garfile/customs/index', context);
            return;
          }
          if (buttonClicked === 'Save and continue') {
            res.redirect('/garfile/supportingdocuments');
          } else {
            res.redirect('/home');
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
      logger.debug('Failed validations submitting declarations');
      context.errors = validationErrs;
      logger.debug(JSON.stringify(validationErrs));
      res.render('app/garfile/customs/index', context);
    });
};
