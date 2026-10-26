const logger = require('../../../common/utils/logger')(__filename);
const ValidationRule = require('../../../common/models/ValidationRule.class');
const validator = require('../../../common/utils/validator');
const CookieModel = require('../../../common/models/Cookie.class');
const garoptions = require('../../../common/seeddata/egar_create_gar_options.json');
const dataAccessApi = require('../../../common/services/dataAccessApi');

module.exports = (req, res) => {
  const garStatus = 'Draft';
  const cookie = new CookieModel(req);

  // Define a validation chain for our representatives field
  const garChain = [
    new ValidationRule(
      validator.notEmpty,
      'garoption',
      req.body.garoption,
      'Select how you would like to create a GAR'
    ),
  ];

  // Validate chains
  return validator
    .validateChains([garChain])
    .then(() => {
      if (req.body.garoption === '1') {
        res.redirect('/garfile/garupload');
        return;
      }

      return dataAccessApi.garApi
        .createGar(cookie.getUserDbId())
        .then((apiResponse) => {
          if (Object.prototype.hasOwnProperty.call(apiResponse, 'message')) {
            // API returned error
            res.render('app/garfile/home/index', {
              cookie,
              garoptions,
              errors: [apiResponse],
            });
            return;
          }
          // Success
          cookie.setGarId(apiResponse.garId);
          cookie.setGarStatus(garStatus);
          req.session.save(() => {
            res.redirect('/garfile/departure');
          });
        })
        .catch((err) => {
          logger.error('Failed to create GAR', {
            userId: cookie.getUserDbId(),
            errorMessage: err?.message,
            stack: err?.stack,
          });
          res.render('app/garfile/home/index', {
            cookie,
            garoptions,
            errors: [
              err?.type === 'http_error' && typeof err.body?.message === 'string'
                ? err.body
                : { message: 'Failed to create GAR. Try again' },
            ],
          });
        });
    })
    .catch((err) => {
      logger.warn('GAR creation validation failed', { userId: cookie.getUserDbId() });
      res.render('app/garfile/home/index', {
        cookie,
        garoptions,
        errors: err,
      });
    });
};
