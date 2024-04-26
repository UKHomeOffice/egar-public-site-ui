const _ = require('lodash');
const logger = require('../../../common/utils/logger')(__filename);
const validator = require('../../../common/utils/validator');
const CookieModel = require('../../../common/models/Cookie.class');
const garApi = require('../../../common/services/garApi');
const ValidationRule = require('../../../common/models/ValidationRule.class');
const airportValidation = require('../../../common/utils/airportValidation');

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
        // Temporary redirect (307) so this POST also becomes a POST for garfile/view
        res.redirect(307, '/garfile/view');
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
const portChoiceMsg = 'Select whether the port code is known';
const portCodeMsg = 'The arrival airport code must be entered';
const futureDateMsg = 'Arrival date must be today or in the future';
const realDateMsg = 'Enter a real arrival date';
const timeMsg = 'Enter a real arrival time';
const latitudeMsg = 'Value entered is incorrect. Enter latitude to 6 decimal places';
const longitudeMsg = 'Value entered is incorrect. Enter longitude to 6 decimal places';
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
    new ValidationRule(validator.notEmpty, 'arrivalPort', voyage.arrivalPort, portCodeMsg),
    new ValidationRule(validator.isValidAirportCode, 'arrivalPort', voyage.arrivalPort, 'Arrival port should be an ICAO or IATA code')
  ];

  // Define latitude validations
  const arrivalLatValidation = [new ValidationRule(validator.latitude, 'arrivalLat', voyage.arrivalLat, latitudeMsg)];

  // Define latitude validations
  const arrivalLongValidation = [new ValidationRule(validator.longitude, 'arrivalLong', voyage.arrivalLong, longitudeMsg)];

  const validations = [
    [new ValidationRule(validator.realDate, 'arrivalDate', arriveDateObj, realDateMsg)],
    [new ValidationRule(validator.currentOrPastDate, 'arrivalDate', arriveDateObj, __('field_arrival_date_too_far_in_future'))],
    [new ValidationRule(validator.dateNotMoreThanMonthInFuture, 'arrivalDate', arriveDateObj, __('field_arrival_date_too_far_in_future'))],
    [new ValidationRule(validator.validTime, 'arrivalTime', arrivalTimeObj, timeMsg)],
    [new ValidationRule(validator.notEmpty, 'portChoice', voyage.portChoice, portChoiceMsg)],
  ];


  // Check if port code is greater than 4 as then need to validate lat/long
  if (arrivePortObj.portCode.length > 4) {
    validations.push(
      arrivalLatValidation,
      arrivalLongValidation,
    );
  } else if (voyage.portChoice) {
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
  delete voyage.buttonClicked;
  if (voyage.portChoice === 'No') {
    logger.debug('Testing arrival Lat and Long values...');

    logger.debug('arrivalLat: ' + voyage.arrivalLat);
    logger.debug('arrivalLong: ' + voyage.arrivalLong);
    const combinedCoordinates = `${voyage.arrivalLat} ${voyage.arrivalLong}`;
    voyage.arrivalPort = combinedCoordinates;
    logger.debug('arrivalPort: ' + voyage.arrivalPort);
  } else {
    // If 'Yes' is selected then clear the coordinate values
    voyage.arrivalLat = '';
    voyage.arrivalLong = '';
    voyage.arrivalPort = _.toUpper(voyage.arrivalPort);
    logger.debug(voyage.arrivalPort);
  }
  cookie.setGarArrivalVoyage(voyage);

  const validations = buildValidations(voyage);

  const gar = await garApi.get(cookie.getGarId());
  const departurePort = JSON.parse(gar).departurePort;

  validations.push([
    new ValidationRule(validator.notSameValues, 'arrivalPort', [voyage.arrivalPort, departurePort], samePortMsg),
  ]);

  if (voyage.arrivalPort.length <= 4 && departurePort.length <= 4) {
    validations.push([
      new ValidationRule(airportValidation.includesOneBritishAirport, 'arrivalPort', [voyage.arrivalPort, departurePort], airportValidation.notBritishMsg),
    ]);
  }


  validator.validateChains(validations)
    .then(() => {
      performAPICall(cookie, buttonClicked, res);
    })
    .catch((err) => {
      logger.info('GAR arrival validation failed');
      logger.debug(JSON.stringify(err));
      res.render('app/garfile/arrival/index', {
        cookie,
        errors: err,
      });
    });
};
