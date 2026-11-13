const logger = require('../../../common/utils/logger')(__filename);
const ValidationRule = require('../../../common/models/ValidationRule.class');
const validator = require('../../../common/utils/validator');
const CookieModel = require('../../../common/models/Cookie.class');
const garoptions = require('../../../common/seeddata/egar_create_gar_options.json');
const createGarApi = require('../../../common/services/createGarApi.js');

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
  validator
    .validateChains([garChain])
    .then(() => {
      if (req.body.garoption === '1') {
        res.redirect('/garfile/garupload');
        return;
      }

      createGarApi
        .createGar(cookie.getUserDbId())
        .then((apiResponse) => {
          const parsedResponse = JSON.parse(apiResponse);
          if (Object.prototype.hasOwnProperty.call(parsedResponse, 'message')) {
            // API returned error
            res.render('app/garfile/home/index', {
              cookie,
              garoptions,
              errors: [parsedResponse],
            });
            return;
          }
          // Success
          cookie.setGarId(parsedResponse.garId);
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
