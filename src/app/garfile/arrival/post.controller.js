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
    new ValidationRule(validator.notEmpty, 'arrivalPort', voyage.arrivalPort, __('field_arrival_port_code_validation')),
    new ValidationRule(validator.isValidAirportCode, 'arrivalPort', voyage.arrivalPort, 'Arrival port should be an ICAO or IATA code')
  ];

  const arrivalLatValidation = [new ValidationRule(validator.latitude, 'arrivalLat', voyage.arrivalLat, __('field_latitude_validation'))];
  const arrivalLongValidation = [new ValidationRule(validator.longitude, 'arrivalLong', voyage.arrivalLong, __('field_longitude_validation'))];

  const validations = [
    [new ValidationRule(validator.realDate, 'arrivalDate', arriveDateObj, __('field_arrival_date_validation'))],
    [new ValidationRule(validator.currentOrPastDate, 'arrivalDate', arriveDateObj, __('field_arrival_date_too_far_in_future'))],
    [new ValidationRule(validator.dateNotMoreThanMonthInFuture, 'arrivalDate', arriveDateObj, __('field_arrival_date_too_far_in_future'))],
    [new ValidationRule(validator.validTime, 'arrivalTime', arrivalTimeObj, __('field_arrival_time_validation'))],
    [new ValidationRule(validator.notEmpty, 'portChoice', voyage.portChoice, __('field_port_choice_message'))],
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

  if (voyage.portChoice === 'Yes') {
    voyage.arrivalLat = '';
    voyage.arrivalLong = '';
  } else {
    voyage.arrivalPort = `${voyage.arrivalLat} ${voyage.arrivalLong}`;
  }
  cookie.setGarArrivalVoyage(voyage);

  const validations = buildValidations(voyage);

  const gar = await garApi.get(cookie.getGarId());
  const departurePort = JSON.parse(gar).departurePort;

  validations.push([
    new ValidationRule(validator.notSameValues, 'arrivalPort', [voyage.arrivalPort, departurePort], __('field_arrival_port_different_departure')),
  ]);

  if (voyage.portChoice === 'Yes') {
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
