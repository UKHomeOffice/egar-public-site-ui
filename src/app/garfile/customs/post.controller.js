const _ = require('lodash');
const logger = require('../../../common/utils/logger')(__filename);
const validations = require('./validations');
const validator = require('../../../common/utils/validator');
const CookieModel = require('../../../common/models/Cookie.class');
const dataAccessApi = require('../../../common/services/dataAccessApi');
const prohibitedGoodsOptions = require('../../../common/seeddata/egar_prohibited_goods_options.json');
const baggageOptions = require('../../../common/seeddata/egar_baggage_options.json');
const reasonForVisitOptions = require('../../../common/seeddata/egar_visit_reason_options.json');
const freeCirculationOptions = require('../../../common/seeddata/egar_craft_eu_free_circulation_options.json');
const intentionValueOptions = require('../../../common/seeddata/egar_intention_value_options.json');
const continentalShelfOptions = require('../../../common/seeddata/egar_continental_shelf_options.json');

module.exports = (req, res) => {
  const cookie = new CookieModel(req);

  req.body.goodsDeclaration = _.trim(req.body.goodsDeclaration);
  req.body.baggageDeclaration = _.trim(req.body.baggageDeclaration);
  req.body.supportingInformationAnswer = _.trim(req.body.supportingInformationAnswer);
  req.body.passengerTravellingReason = _.trim(req.body.passengerTravellingReason);

  const customs = {
    prohibitedGoods: req.body.prohibitedGoods,
    goodsDeclaration: req.body.prohibitedGoods === 'Yes' ? req.body.goodsDeclaration : '',
    baggage: req.body.baggage,
    baggageDeclaration: req.body.baggage === 'Yes' ? req.body.baggageDeclaration : '',
    continentalShelf: req.body.continentalShelf,
    continentalShelfDeclaration: req.body.continentalShelf === 'Yes' ? req.body.continentalShelfDeclaration : '',
    freeCirculation: req.body.freeCirculation,
    visitReason: req.body.visitReason,
    supportingInformation: req.body.supportingInformation,
    supportingInformationAnswer: req.body.supportingInformation === 'Yes' ? req.body.supportingInformationAnswer : '',
    passengerTravellingReason: req.body.passengerTravellingReason,
    passengerTravellingReasonAnswer:
      req.body.passengerTravellingReason === 'Yes' ? req.body.passengerTravellingReasonAnswer : '',
    intentionValue: req.body.intentionValue,
  };

  const context = {
    freeCirculationOptions,
    reasonForVisitOptions,
    prohibitedGoodsOptions,
    baggageOptions,
    intentionValueOptions,
    continentalShelfOptions,
    cookie,
    gar: customs,
  };

  const { buttonClicked } = req.body;

  return validator
    .validateChains(validations.validations(req))
    .then(() => {
      return dataAccessApi.garApi
        .patch(res.locals.gar.garId, cookie.getGarStatus(), customs)
        .then((apiResponse) => {
          if (Object.prototype.hasOwnProperty.call(apiResponse, 'message')) {
            context.errors = [apiResponse];
            res.render('app/garfile/customs/index', context);
            return;
          }
          if (buttonClicked === 'Save and continue') {
            res.redirect('/garfile/supportingdocuments');
          } else {
            res.redirect(307, '/garfile/view');
          }
        })
        .catch((err) => {
          logger.error('Failed to update GAR', {
            garId: cookie.getGarId(),
            errorMessage: err?.message,
            stack: err?.stack,
          });
          context.errors = [
            err?.type === 'http_error' && typeof err.body?.message === 'string'
              ? err.body
              : { message: 'Failed to save customs information. Try again' },
          ];
          res.render('app/garfile/customs/index', context);
        });
    })
    .catch((validationErrs) => {
      logger.debug('Failed validations submitting declarations');
      context.errors = validationErrs;
      res.render('app/garfile/customs/index', context);
    });
};
