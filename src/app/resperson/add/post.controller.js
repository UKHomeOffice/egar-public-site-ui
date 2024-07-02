const _ = require('lodash');

const logger = require('../../../common/utils/logger')(__filename);
const validator = require('../../../common/utils/validator');
const validations = require('../validations');
const CookieModel = require('../../../common/models/Cookie.class');
const fixedBasedOperatorOptions = require('../../../common/seeddata/fixed_based_operator_options.json');
const resPersonApi = require('../../../common/services/resPersonApi');
const utils = require('../../../common/utils/utils');

module.exports = (req, res) => {

  const cookie = new CookieModel(req);
  req.body.fixedBasedOperatorAnswer = _.trim(req.body.fixedBasedOperatorAnswer);
  const responsiblePerson = utils.getResponsiblePersonFromReq(req);

  validator.validateChains(validations.validations(req))
  .then(() => {
    resPersonApi.create(cookie.getUserDbId(), responsiblePerson).then((apiResponse) => {
      const parsedResponse = JSON.parse(apiResponse);
      if (Object.prototype.hasOwnProperty.call(parsedResponse, 'message')) {
        res.render('app/resperson/add/index', {
          cookie, fixedBasedOperatorOptions, errors: [parsedResponse], responsiblePerson
        });
      } else {
        res.redirect('/resperson');
      }
    }).catch((err) => {
      logger.error('There was a problem adding person to saved people');
      logger.error(err);
      res.render('app/resperson/add/index', {
        cookie, fixedBasedOperatorOptions, errors: [{ message: 'There was a problem creating the person. Please try again' }],
      });
    });
  })
  .catch((err) => {
    logger.info('Validation errors creating a new responsible person');
      logger.debug(JSON.stringify(err));
      res.render('app/resPerson/add/index', {
        cookie, req,  fixedBasedOperatorOptions, errors: err, responsiblePerson
      });
  });
};