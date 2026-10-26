const logger = require('../../../common/utils/logger')(__filename);
const CookieModel = require('../../../common/models/Cookie.class');
const fixedBasedOperatorOptions = require('../../../common/seeddata/fixed_based_operator_options.json');
const utils = require('../../../common/utils/utils');
const validator = require('../../../common/utils/validator');
const validations = require('../../resperson/validations');
const dataAccessApi = require('../../../common/services/dataAccessApi');

module.exports = async (req, res) => {
  const cookie = new CookieModel(req);
  const { buttonClicked } = req.body;
  const resPersonId = req.body.addResponsiblePerson;
  if (resPersonId && buttonClicked === 'Add to GAR') {
    try {
      res.redirect('/garfile/resperson?resPersonId=' + resPersonId);
    } catch (err) {
      logger.error('Failed to retrieve GAR responsible person', {
        garId: cookie.getGarId(),
        errorMessage: err?.message,
        stack: err?.stack,
      });
      res.render('app/garfile/resperson/index', {
        cookie,
        fixedBasedOperatorOptions,
        errors: [
          {
            message: 'Problem retrieving GAR',
          },
        ],
      });
    }
  } else {
    const responsiblePerson = utils.getResponsiblePersonFromReq(req);
    let responsiblePersons;
    try {
      responsiblePersons = await dataAccessApi.resPersonApi.getResPersons(cookie.getUserDbId());
    } catch (err) {
      logger.error('Failed to get saved responsible persons', {
        errorMessage: err?.message,
        stack: err?.stack,
      });
      return res.render('app/garfile/resperson/index', {
        cookie,
        responsiblePerson,
        fixedBasedOperatorOptions,
        errors: [{ message: 'Failed to get saved responsible persons' }],
      });
    }
    return validator
      .validateChains(validations.validations(req))
      .then(() => {
        return dataAccessApi.garApi
          .patch(res.locals.gar.garId, cookie.getGarStatus(), responsiblePerson)
          .then((apiResponse) => {
            if (Object.prototype.hasOwnProperty.call(apiResponse, 'message')) {
              res.render('app/garfile/resperson/index', {
                cookie,
                fixedBasedOperatorOptions,
                errors: [apiResponse],
              });
              return;
            }
            // Successful api response
            cookie.setGarResponsiblePerson(responsiblePerson);
            if (buttonClicked === 'Save and continue') {
              res.redirect('/garfile/customs');
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
            res.render('app/garfile/resperson/index', {
              cookie,
              responsiblePerson,
              responsiblePersons,
              fixedBasedOperatorOptions,
              errors: [
                err?.type === 'http_error' && typeof err.body?.message === 'string'
                  ? err.body
                  : { message: 'Failed to add to GAR' },
              ],
            });
          });
      })
      .catch((err) => {
        logger.warn('GAR responsible person validation failed', { garId: cookie.getGarId() });
        cookie.setGarResponsiblePerson(responsiblePerson);
        res.render('app/garfile/resperson/index', {
          cookie,
          responsiblePerson,
          responsiblePersons,
          fixedBasedOperatorOptions,
          errors: err,
        });
      });
  }
};
