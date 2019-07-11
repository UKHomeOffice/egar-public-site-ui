const _ = require('lodash');
const logger = require('../../../common/utils/logger')(__filename);
const validator = require('../../../common/utils/validator');
const CookieModel = require('../../../common/models/Cookie.class');
const garApi = require('../../../common/services/garApi');
const ValidationRule = require('../../../common/models/ValidationRule.class');

const performAPICall = (cookie, buttonClicked, res) => {
  garApi.patch(cookie.getGarId(), cookie.getGarStatus(), cookie.getGarArrivalVoyage())
    .then((apiResponse) => {
      const parsedResponse = JSON.parse(apiResponse);
      if (Object.prototype.hasOwnProperty.call(parsedResponse, 'message')) {
        // API returned error
        logger.debug(`Api returned: ${parsedResponse}`);
        res.render('app/garfile/arrival/index', {
          cookie,
          errors: [parsedResponse],
        });
        return;
      }
      // Successful
      if (buttonClicked === 'Save and continue') {
        res.redirect('/garfile/craft');
      } else {
        res.redirect('/home');
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
};

// Define port / date validation msgs
const portMsg = 'As you have entered an arrival port code of "ZZZZ", you must provide longitude and latitude coordinates for the location';
const portCodeMsg = 'The arrival airport code must be a minimum of 3 letters and a maximum of 4 letters';
const futureDateMsg = 'Arrival date must be today or in the future';
const realDateMsg = 'Enter a real arrival date';
const timeMsg = 'Enter a real arrival time';
const latitudeMsg = 'Value entered is incorrect. Enter latitude to 4 decimal places';
const longitudeMsg = 'Value entered is incorrect. Enter longitude to 4 decimal places';
const samePortMsg = 'Arrival port must be different to departure port';

const buildValidations = (voyage) => {
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
    new ValidationRule(validator.validPort, 'arrivalPort', voyage.arrivalPort, portCodeMsg),
  ];

  // Define ZZZZ port validations
  const arrivalPortZZZZ = [new ValidationRule(validator.validatePortCoords, 'arrivalPort', arrivePortObj, portMsg)];

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
  ];

  // Check if port code is ZZZZ as then need to validate lat/long
  if (arrivePortObj.portCode.toUpperCase() === 'ZZZZ') {
    validations.push(
      arrivalPortZZZZ,
      arrivalLatValidation,
      arrivalLongValidation,
    );
  } else {
    // if not just add port validation
    validations.push(
      arrivalPortValidation,
    );
  }

  return validations;
};

module.exports = async (req, res) => {
  logger.debug('In garfile / arrival post controller');

  const cookie = new CookieModel(req);
  const { buttonClicked } = req.body;

  // Define voyage
  const voyage = req.body;
  voyage.arrivalPort = _.toUpper(voyage.arrivalPort);
  delete voyage.buttonClicked;
  cookie.setGarArrivalVoyage(voyage);

  const validations = buildValidations(voyage);

  const gar = await garApi.get(cookie.getGarId());

  validations.push(
    [
      new ValidationRule(validator.notSameValues, 'arrivalPort', [voyage.arrivalPort, JSON.parse(gar).departurePort], samePortMsg),
    ],
  );

  validator.validateChains(validations)
    .then(() => {
      performAPICall(cookie, buttonClicked, res);
    })
    .catch((err) => {
      logger.info('Validation failed');
      logger.info(JSON.stringify(err));
      res.render('app/garfile/arrival/index', {
        cookie,
        errors: err,
      });
    });
};
