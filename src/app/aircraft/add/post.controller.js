const _ = require('lodash');

const logger = require('../../../common/utils/logger')(__filename);
const validator = require('../../../common/utils/validator');
const CookieModel = require('../../../common/models/Cookie.class');
const craftApi = require('../../../common/services/craftApi');
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
  validator
    .validateChains(validationChain)
    .then(() => {
      const craftBase = cookie.reduceCraftBase(craftBasePort, craftBaseLat, craftBaseLong);

      // call the API to update the data base and then
      craftApi.create(registration, craftType, craftBase, cookie.getUserDbId()).then((apiResponse) => {
        try {
          const parsedResponse = JSON.parse(apiResponse);
          if (Object.prototype.hasOwnProperty.call(parsedResponse, 'message')) {
            res.render('app/aircraft/add/index', { errors: [parsedResponse], cookie });
          } else {
            // Set the page to a large number and expect the page to redirect back to
            // the correct last page (two calls in exchange for less logic to calculate the last page)
            pagination.setCurrentPage(req, '/aircraft', 1000000);
            req.session.save(() => res.redirect('/aircraft'));
          }
        } catch (err) {
          logger.error('Parsing attempt from API caused error, was not JSON');
          let errMsg = { message: 'There was a problem saving the aircraft. Try again later' };
          if (_.toString(apiResponse).includes('DETAIL:  Key (registration)')) {
            errMsg = { message: 'Craft already exists' };
          }
          res.render('app/aircraft/add/index', {
            cookie,
            craftObj,
            errors: [errMsg],
          });
        }
      });
    })
    .catch((err) => {
      logger.info('Add craft postcontroller - There was a problem with adding the saved craft');
      logger.info(err);
      res.render('app/aircraft/add/index', {
        cookie,
        craftObj,
        errors: err,
      });
    });
};
