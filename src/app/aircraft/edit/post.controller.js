const _ = require('lodash');

const logger = require('../../../common/utils/logger')(__filename);
const validator = require('../../../common/utils/validator');
const CookieModel = require('../../../common/models/Cookie.class');
const { craftApi } = require('../../../common/services/dataAccessApi');
const craftValidations = require('../../../app/garfile/craft/validations');

module.exports = (req, res) => {
  // Start by clearing cookies and initialising
  const cookie = new CookieModel(req);

  const { registration, craftType, craftBasePort, craftBaseLat, craftBaseLong, portChoice = 'Yes' } = req.body;
  const { craftId } = cookie.getEditCraft();

  const craftObj = {
    registration,
    craftType,
    craftBasePort,
    craftBaseLat,
    craftBaseLong,
    portChoice,
  };

  const craftBase = cookie.reduceCraftBase(craftObj.craftBasePort, craftObj.craftBaseLat, craftObj.craftBaseLong);
  cookie.updateEditCraft(registration, craftType, craftBase);

  if (portChoice === 'Yes') {
    delete craftObj.craftBaseLat;
    delete craftObj.craftBaseLong;
  } else {
    delete craftObj.craftBasePort;
  }

  const validationChain = craftValidations.validations(craftObj);

  // Validate chains
  return validator
    .validateChains(validationChain)
    .then(() => {
      // call the API to update craft
      return craftApi
        .update(registration, craftType, craftBase, cookie.getUserDbId(), craftId)
        .then((apiResponse) => {
          if (apiResponse && typeof apiResponse === 'object') {
            if (Object.prototype.hasOwnProperty.call(apiResponse, 'message')) {
              // API returned failure
              return res.render('app/aircraft/edit/index', { cookie, errors: [apiResponse] });
            } else {
              // API returned successful
              return res.redirect('/aircraft');
            }
          }
          logger.error('Unexpected response updating aircraft');
          return renderApiError(apiResponse);
        })
        .catch((err) => {
          logger.error('Failed to update aircraft', {
            craftId,
            errorMessage: err?.message,
            stack: err?.stack,
          });
          if (err?.type === 'http_error') {
            return renderApiError(err.body);
          }
          return res.render('app/aircraft/edit/index', {
            cookie,
            errors: [{ message: 'An error has occurred. Try again later' }],
          });
        });
    })
    .catch((err) => {
      logger.info('Edit SavedCraft postcontroller - There was a problem with editing the saved craft');
      res.render('app/aircraft/edit/index', { cookie, errors: err });
    });

  function renderApiError(body) {
    if (body && typeof body === 'object' && Object.prototype.hasOwnProperty.call(body, 'message')) {
      return res.render('app/aircraft/edit/index', { cookie, errors: [body] });
    }
    const message = _.toString(body).includes('DETAIL:  Key (registration)')
      ? 'Craft already exists'
      : 'There was a problem saving the aircraft. Try again later';
    return res.render('app/aircraft/edit/index', { cookie, errors: [{ message }] });
  }
};
