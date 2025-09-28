import loggerFactory from '../../../common/utils/logger.js';
const logger = loggerFactory(import.meta.url);
import ValidationRule from '../../../common/models/ValidationRule.class.js';
import validator from '../../../common/utils/validator.js';
import CookieModel from '../../../common/models/Cookie.class.js';
import garoptions from '../../../common/seeddata/egar_create_gar_options.json' with { type: "json"};
import createGarApi from '../../../common/services/createGarApi.js';

export default (req, res) => {
  logger.debug('In garfile / home post controller');

  const garStatus = 'Draft';
  const cookie = new CookieModel(req);

  // Define a validation chain for our representatives field
  const garChain = [
    new ValidationRule(validator.notEmpty, 'garoption', req.body.garoption, 'Select how you would like to create a GAR'),
  ];

  // Validate chains
  validator.validateChains([garChain])
    .then(() => {
      if (req.body.garoption === '1') {
        res.redirect('/garfile/garupload');
        return;
      }

      createGarApi.createGar(cookie.getUserDbId())
        .then((apiResponse) => {
          const parsedResponse = JSON.parse(apiResponse);
          if (Object.prototype.hasOwnProperty.call(parsedResponse, 'message')) {
            // API returned error
            res.render('app/garfile/home/index', {
              cookie, garoptions, errors: [parsedResponse],
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
          logger.error('Failed to create GAR');
          logger.error(err);
          res.render('app/garfile/home/index', {
            cookie,
            garoptions,
          });
        });
    })
    .catch((err) => {
      logger.info('Gar creation validation failed');
      logger.debug(err);
      res.render('app/garfile/home/index', {
        cookie,
        garoptions,
        errors: err,
      });
    });
};
