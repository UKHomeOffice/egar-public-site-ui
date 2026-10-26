const _ = require('lodash');
const logger = require('../../../common/utils/logger')(__filename);
const validator = require('../../../common/utils/validator');
const validations = require('../validations');
const CookieModel = require('../../../common/models/Cookie.class');
const fixedBasedOperatorOptions = require('../../../common/seeddata/fixed_based_operator_options.json');
const utils = require('../../../common/utils/utils');
const dataAccessApi = require('../../../common/services/dataAccessApi');

module.exports = (req, res) => {
  const cookie = new CookieModel(req);

  req.body.fixedBasedOperatorAnswer = _.trim(req.body.fixedBasedOperatorAnswer);

  const responsiblePerson = utils.getResponsiblePersonFromReq(req);
  const resPersonId = req.session.editResponsiblePersonId;
  return validator
    .validateChains(validations.validations(req))
    .then(() => {
      return dataAccessApi.resPersonApi
        .updateResPerson(cookie.getUserDbId(), resPersonId, responsiblePerson)
        .then((apiResponse) => {
          if (Object.prototype.hasOwnProperty.call(apiResponse, 'message')) {
            res.render('app/resperson/edit/index', {
              cookie,
              responsiblePerson,
              fixedBasedOperatorOptions,
              errors: [apiResponse],
            });
          } else {
            res.redirect('/resperson');
          }
        })
        .catch((err) => {
          logger.error('Failed to update responsible person', { errorMessage: err?.message, stack: err?.stack });
          res.render('app/resperson/edit/index', {
            cookie,
            responsiblePerson,
            fixedBasedOperatorOptions,
            errors: [
              err?.type === 'http_error' && err.body && typeof err.body.message === 'string'
                ? err.body
                : { message: 'There was a problem updating responsible person. Please try again' },
            ],
          });
        });
    })
    .catch((err) => {
      logger.warn('Responsible person validation failed', { responsiblePersonId: resPersonId });
      res.render('app/resperson/edit/index', {
        cookie,
        req,
        responsiblePerson,
        fixedBasedOperatorOptions,
        errors: err,
      });
    });
};
