const _ = require('lodash');

const logger = require('../../../common/utils/logger')(__filename);
const validator = require('../../../common/utils/validator');
const CookieModel = require('../../../common/models/Cookie.class');
const { craftApi } = require('../../../common/services/dataAccessApi');
const pagination = require('../../../common/utils/pagination');
const craftValidations = require('../../../app/garfile/craft/validations');

module.exports = (req, res) => {
  // Start by clearing cookies and initialising
  const cookie = new CookieModel(req);

  let { registration, craftType, craftBasePort, craftBaseLat, craftBaseLong, portChoice = 'Yes' } = req.body;

  if (portChoice === 'Yes') {
    craftBaseLat = null;
    craftBaseLong = null;
  } else {
    craftBasePort = null;
  }

  // Define a validation chain for user registeration fields
  const craftObj = {
    registration,
    craftType,
    craftBasePort,
    craftBaseLat,
    craftBaseLong,
    portChoice,
  };

  const validationChain = craftValidations.validations(craftObj);

  // Validate chains
  return validator
    .validateChains(validationChain)
    .then(() => {
      const craftBase = cookie.reduceCraftBase(craftBasePort, craftBaseLat, craftBaseLong);

      // call the API to update the data base and then
      return craftApi
        .create(registration, craftType, craftBase, cookie.getUserDbId())
        .then((apiResponse) => {
          if (apiResponse && typeof apiResponse === 'object') {
            if (Object.prototype.hasOwnProperty.call(apiResponse, 'message')) {
              return res.render('app/aircraft/add/index', { errors: [apiResponse], cookie });
            }
            // Set the page to a large number and expect the page to redirect back to
            // the correct last page (two calls in exchange for less logic to calculate the last page)
            pagination.setCurrentPage(req, '/aircraft', 1000000);
            return req.session.save(() => res.redirect('/aircraft'));
          }
          logger.error('Unexpected response saving aircraft');
          return renderApiError(apiResponse);
        })
        .catch((err) => {
          logger.error('Failed to add craft', {
            errorMessage: err?.message,
            stack: err?.stack,
          });
          return renderApiError(err?.type === 'http_error' ? err.body : undefined);
        });
    })
    .catch((err) => {
      logger.error('Failed to add craft');
      res.render('app/aircraft/add/index', {
        cookie,
        craftObj,
        errors: err,
      });
    });

  function renderApiError(body) {
    if (body && typeof body === 'object' && Object.prototype.hasOwnProperty.call(body, 'message')) {
      return res.render('app/aircraft/add/index', { errors: [body], cookie });
    }
    const message = _.toString(body).includes('DETAIL:  Key (registration)')
      ? 'Craft already exists'
      : 'There was a problem saving the aircraft. Try again later';
    return res.render('app/aircraft/add/index', { cookie, craftObj, errors: [{ message }] });
  }
};
