const _ = require('lodash');
const logger = require('../../../common/utils/logger')(__filename);
const validator = require('../../../common/utils/validator');
const validations = require('../validations');
const CookieModel = require('../../../common/models/Cookie.class');
const fixedBasedOperatorOptions = require('../../../common/seeddata/fixed_based_operator_options.json');
const utils = require('../../../common/utils/utils');
const resPersonApi = require('../../../common/services/resPersonApi');

module.exports = (req, res) => {
  const cookie = new CookieModel(req);

  req.body.fixedBasedOperatorAnswer = _.trim(req.body.fixedBasedOperatorAnswer);

  const responsiblePerson = utils.getResponsiblePersonFromReq(req);
  const resPersonId = req.session.editResponsiblePersonId;
  validator
    .validateChains(validations.validations(req))
    .then(() => {
      resPersonApi
        .updateResPerson(cookie.getUserDbId(), resPersonId, responsiblePerson)
        .then((apiResponse) => {
          const parsedResponse = JSON.parse(apiResponse);
          if (Object.prototype.hasOwnProperty.call(parsedResponse, 'message')) {
            res.render('app/resperson/edit/index', {
              cookie,
              responsiblePerson,
              fixedBasedOperatorOptions,
              errors: [parsedResponse],
            });
          } else {
            res.redirect('/resperson');
          }
        })
        .catch((err) => {
          logger.error('There was a problem adding person to saved people');
          logger.error(err);
          res.render('app/resperson/edit/index', {
            cookie,
            responsiblePerson,
            fixedBasedOperatorOptions,
            errors: [{ message: 'There was a problem updating responsible person. Please try again' }],
          });
        });
    })
    .catch((err) => {
      logger.info('Validation errors creating a new responsible person');
      logger.debug(JSON.stringify(err));
      res.render('app/resperson/edit/index', {
        cookie,
        req,
        responsiblePerson,
        fixedBasedOperatorOptions,
        errors: err,
      });
    });
};
