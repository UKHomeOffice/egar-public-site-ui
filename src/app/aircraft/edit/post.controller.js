const _ = require('lodash');

const logger = require('../../../common/utils/logger')(__filename);
const validator = require('../../../common/utils/validator');
const CookieModel = require('../../../common/models/Cookie.class');
const craftApi = require('../../../common/services/craftApi');
const craftValidations = require('../../../app/garfile/craft/validations');

module.exports = (req, res) => {
  // Start by clearing cookies and initialising
  const cookie = new CookieModel(req);

  const {
    registration,
    craftType,
    craftBasePort,
    craftBaseLat,
    craftBaseLong,
    portChoice = 'Yes',
  } = req.body;
  const { craftId } = cookie.getEditCraft();

  const craftObj = {
    registration,
    craftType,
    craftBasePort,
    craftBaseLat,
    craftBaseLong,
    portChoice,
  };

  const craftBase = cookie.reduceCraftBase(
    craftObj.craftBasePort,
    craftObj.craftBaseLat,
    craftObj.craftBaseLong
  );
  cookie.updateEditCraft(registration, craftType, craftBase);

  if (portChoice === 'Yes') {
    delete craftObj.craftBaseLat;
    delete craftObj.craftBaseLong;
  } else {
    delete craftObj.craftBasePort;
  }

  const validationChain = craftValidations.validations(craftObj);

  // Validate chains
  validator
    .validateChains(validationChain)
    .then(() => {
      // call the API to update craft
      craftApi
        .update(
          registration,
          craftType,
          craftBase,
          cookie.getUserDbId(),
          craftId
        )
        .then((apiResponse) => {
          try {
            const parsedResponse = JSON.parse(apiResponse);
            if (
              Object.prototype.hasOwnProperty.call(parsedResponse, 'message')
            ) {
              // API returned failure
              res.render('app/aircraft/edit/index', {
                cookie,
                errors: [parsedResponse],
              });
            } else {
              // API returned successful
              res.redirect('/aircraft');
            }
          } catch (err) {
            logger.error(
              'Error parsing response updating aircraft, may not be JSON'
            );
            let errMsg = {
              message:
                'There was a problem saving the aircraft. Try again later',
            };
            if (
              _.toString(apiResponse).includes('DETAIL:  Key (registration)')
            ) {
              errMsg = { message: 'Craft already exists' };
            }
            res.render('app/aircraft/edit/index', { cookie, errors: [errMsg] });
          }
        })
        .catch((err) => {
          logger.error('Unexpected error updating aircraft');
          logger.error(err);
          res.render('app/aircraft/edit/index', {
            cookie,
            errors: [{ message: 'An error has occurred. Try again later' }],
          });
        });
    })
    .catch((err) => {
      logger.info(
        'Edit SavedCraft postcontroller - There was a problem with editing the saved craft'
      );
      logger.info(JSON.stringify(err));
      res.render('app/aircraft/edit/index', { cookie, errors: err });
    });
};
