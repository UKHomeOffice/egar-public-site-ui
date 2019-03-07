const logger = require('../../../common/utils/logger');
const ValidationRule = require('../../../common/models/ValidationRule.class');
const validator = require('../../../common/utils/validator');
const CookieModel = require('../../../common/models/Cookie.class');
const userattributes = require('../../../common/seeddata/egar_user_account_details.json');
const garoptions = require('../../../common/seeddata/egar_create_gar_options.json');
const createGarApi = require('../../../common/services/createGarApi.js');


module.exports = (req, res) => {
  logger.debug('In garfile / home post controller');

  const garStatus = 'Draft';
  const garOption = req.body.garoption;
  const cookie = new CookieModel(req);
  cookie.setUserGarOp(garOption);

  // Define a validation chain for our representatives field
  const garChain = [
    new ValidationRule(validator.notEmpty, 'garoption', req.body.garoption, 'Select how you would like to create a GAR'),
  ];

  // Validate chains
  validator.validateChains([garChain])
    .then(() => {
      if (req.body.garoption === '1') return res.redirect('/garfile/garupload');

      createGarApi.createGar(cookie.getUserDbId())
        .then((apiResponse) => {
          const parsedResponse = JSON.parse(apiResponse);
          if (parsedResponse.hasOwnProperty('message')) {
            // API returned error
            res.render('app/garfile/manifest/index', {
              errors: [parsedResponse],
              cookie,
            });
          } else {
            cookie.setGarId(parsedResponse.garId);
            cookie.setGarStatus(garStatus);
          }
          if (req.body.garoption === '0') {
            // Redirect to page 1 of gar form.
            res.redirect('/garfile/departure');
          }
        })
        .catch((err) => {
          logger.error('Failed to create GAR');
          logger.error(err);
          res.render('app/garfile/home/index', {
            cookie,
            userattributes,
            garoptions,
          });
        });
    })
    .catch((err) => {
      logger.debug('Gar creation validation failed');
      logger.debug(err);
      res.render('app/garfile/home/index', {
        cookie,
        userattributes,
        garoptions,
        errors: err,
      });
    });
};
