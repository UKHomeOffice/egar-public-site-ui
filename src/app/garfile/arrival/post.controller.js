const logger = require('../../../common/utils/logger');
const validator = require('../../../common/utils/validator');
const CookieModel = require('../../../common/models/Cookie.class');
const garApi = require('../../../common/services/garApi');
const ValidationRule = require('../../../common/models/ValidationRule.class');

module.exports = (req, res) => {
  logger.debug('In garfile / arrival post controller');

  const cookie = new CookieModel(req);
  const buttonClicked = req.body.buttonClicked;

  // Define voyage
  const voyage = req.body;
  delete voyage.buttonClicked;
  cookie.setGarArrivalVoyage(voyage);

  // Define not empty validations
  const validationIds = ['arrivalPort'];
  const validationValues = [voyage.arrivalPort];
  const validationMsgs = ['Enter an arrival port'];

  // Define port / date validation msgs
  const portMsg = 'If you do not have the airport code, enter \'ZZZZ\' and enter the latitude and longitude to 4 decimal places below.';
  const portCodeMsg = 'The arrival airport code must be a minimum of 3 letters and a maximum of 4 letters.';
  const futureDateMsg = 'Arrival date must be today or in the future';
  const realDateMsg = 'Enter a real Arrival date';
  const timeMsg = 'Enter a real Arrival time';
  const latitudeMsg = 'Value entered is incorrect. Please enter latitude to 4 decimal places.';
  const longitudeMsg = 'Value entered is incorrect. Please enter longitude to 4 decimal places.';

  // Create validation input objs
  const arrivePortObj = {
    portCode: voyage.arrivalPort,
    lat: voyage.arrivalLat,
    long: voyage.arrivalLong,
  };
  const arriveDateObj = {
    d: voyage.arrivalDay,
    m: voyage.arrivalMonth,
    y: voyage.arrivalYear,
  };
  const arrivalTimeObj = {
    h: voyage.arrivalHour,
    m: voyage.arrivalMinute,
  };

  // Define port validations
  const arrivalPortValidation = [
    new ValidationRule(validator.validatePortCoords, 'arrivalPort', arrivePortObj, portMsg),
    new ValidationRule(validator.validPort, 'arrivalPort', voyage.arrivalPort, portCodeMsg),
  ];

  // Define blank port validations
  const arrivalPortBlank = [new ValidationRule(validator.notEmpty, 'arrivalPort', voyage.arrivalPort, portMsg)];

  // Define latitude validations
  const arrivalLatValidation = [new ValidationRule(validator.lattitude, 'arrivalLat', voyage.arrivalLat, latitudeMsg)];

  // Define latitude validations
  const arrivalLongValidation = [new ValidationRule(validator.longitude, 'arrivalLong', voyage.arrivalLong, longitudeMsg)];

  const validations = [
    [
      new ValidationRule(validator.realDate, 'arrivalDate', arriveDateObj, realDateMsg),
    ],
    [
      new ValidationRule(validator.currentOrFutureDate, 'arrivalDate', arriveDateObj, futureDateMsg),
    ],
    [
      new ValidationRule(validator.validTime, 'arrivalTime', arrivalTimeObj, timeMsg),
    ],
    [
      new ValidationRule(validator.notEmpty, validationIds, validationValues, validationMsgs),
    ],
  ];

  // Check if port is blank
  if (voyage.arrivalPort.length === 0) {
    validations.push(
      arrivalPortBlank,
    );
  }

  // Check if port code is ZZZZ or blank as then need to validate lat/long
  if (arrivePortObj.portCode.toUpperCase() === 'ZZZZ' || voyage.arrivalPort.length === 0) {
    validations.push(
      arrivalLatValidation,
      arrivalLongValidation,
    );
  } else {
    // if not just add port validation
    validations.push(
      arrivalPortValidation,
    );
  }

  validator.validateChains(validations)
    .then(() => {
      garApi.patch(cookie.getGarId(), cookie.getGarStatus(), cookie.getGarArrivalVoyage())
        .then((apiResponse) => {
          const parsedResponse = JSON.parse(apiResponse);
          if (parsedResponse.hasOwnProperty('message')) {
            // API returned error
            logger.debug(`Api returned: ${parsedResponse}`);
            res.render('app/garfile/arrival/index', {
              cookie,
              errors: [parsedResponse],
            });
          } else {
            // Successful
            return buttonClicked === 'Save and continue' ? res.redirect('/garfile/craft') : res.redirect('/home');
          }
        })
        .catch((err) => {
          logger.error('Api failed to update GAR');
          logger.error(err);
          res.render('app/garfile/arrival/index', {
            cookie,
            errors: [{
              message: 'Failed to add to GAR',
            }],
          });
        });
    })
    .catch((err) => {
      logger.info('Validation failed');
      logger.info(err);
      res.render('app/garfile/arrival/index', {
        cookie,
        errors: err,
      });
    });
};
