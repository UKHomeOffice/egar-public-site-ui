import _ from 'lodash';
import loggerFactory from '../../../common/utils/logger.js';
const logger = loggerFactory(import.meta.url);
import validations from './validations.js';
import validator from '../../../common/utils/validator.js';
import CookieModel from '../../../common/models/Cookie.class.js';
import garApi from '../../../common/services/garApi.js';
import prohibitedGoodsOptions from '../../../common/seeddata/egar_prohibited_goods_options.json' with { type: "json"};
import baggageOptions from '../../../common/seeddata/egar_baggage_options.json' with { type: "json"};
import reasonForVisitOptions from '../../../common/seeddata/egar_visit_reason_options.json' with { type: "json"};
import freeCirculationOptions from '../../../common/seeddata/egar_craft_eu_free_circulation_options.json' with { type: "json"};
import intentionValueOptions from '../../../common/seeddata/egar_intention_value_options.json' with { type: "json"};
import continentalShelfOptions from '../../../common/seeddata/egar_continental_shelf_options.json' with { type: "json"};

export default (req, res) => {
  const cookie = new CookieModel(req);

  req.body.goodsDeclaration = _.trim(req.body.goodsDeclaration);
  req.body.baggageDeclaration = _.trim(req.body.baggageDeclaration);
  req.body.supportingInformationAnswer = _.trim(req.body.supportingInformationAnswer);
  req.body.passengerTravellingReason = _.trim(req.body.passengerTravellingReason);

  const customs = {
    prohibitedGoods: req.body.prohibitedGoods,
    goodsDeclaration: (req.body.prohibitedGoods === 'Yes' ? req.body.goodsDeclaration : ''),
    baggage: req.body.baggage,
    baggageDeclaration: (req.body.baggage === 'Yes' ? req.body.baggageDeclaration : ''),
    continentalShelf: req.body.continentalShelf,
    continentalShelfDeclaration: (req.body.continentalShelf === 'Yes' ? req.body.continentalShelfDeclaration : ''),
    freeCirculation: req.body.freeCirculation,
    visitReason: req.body.visitReason,
    supportingInformation: req.body.supportingInformation,
    supportingInformationAnswer: (req.body.supportingInformation === 'Yes' ? req.body.supportingInformationAnswer : ''),
    passengerTravellingReason: req.body.passengerTravellingReason,
    passengerTravellingReasonAnswer: (req.body.passengerTravellingReason === 'Yes' ? req.body.passengerTravellingReasonAnswer : ''),
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

  logger.debug(req.body.prohibitedGoods);

  const { buttonClicked } = req.body;

  validator.validateChains(validations(req))
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
            res.redirect(307, '/garfile/view');
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
      logger.info(JSON.stringify(validationErrs));
      res.render('app/garfile/customs/index', context);
    });
};
