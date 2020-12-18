const _ = require('lodash');

const logger = require('../../../common/utils/logger')(__filename);
const validations = require('./validations');
const validator = require('../../../common/utils/validator');
const CookieModel = require('../../../common/models/Cookie.class');
const garApi = require('../../../common/services/garApi');
const prohibitedGoodsOptions = require('../../../common/seeddata/egar_prohibited_goods_options');
const reasonForVisitOptions = require('../../../common/seeddata/egar_visit_reason_options.json');

module.exports = (req, res) => {
  const cookie = new CookieModel(req);

  req.body.goodsDeclaration = _.trim(req.body.goodsDeclaration);

  const customs = {
    prohibitedGoods: req.body.prohibitedGoods,
    goodsDeclaration: (req.body.prohibitedGoods === 'Yes' ? req.body.goodsDeclaration : ''),
    visitReason: req.body.visitReason,
  };

  const context = {
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
