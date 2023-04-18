const _ = require('lodash');
const logger = require('../../../common/utils/logger')(__filename);
const validator = require('../../../common/utils/validator');
const CookieModel = require('../../../common/models/Cookie.class');
const garApi = require('../../../common/services/garApi');
const ValidationRule = require('../../../common/models/ValidationRule.class');
const airportValidation = require('../../../common/utils/airportValidation');

const createValidationChains = (voyage) => {

  // Create validation input objs
  const departPortObj = {
    portCode: voyage.departurePort,
    lat: voyage.departureLat,
    long: voyage.departureLong,
  };
  const departDateObj = {
    d: voyage.departureDay,
    m: voyage.departureMonth,
    y: voyage.departureYear,
  };
  const departureTimeObj = {
    h: voyage.departureHour,
    m: voyage.departureMinute,
  };


  // Define port validations
  const departurePortValidation = [
    new ValidationRule(validator.notEmpty, 'departurePort', voyage.departurePort, __('field_departure_port_code_validation')),
  ];

  // Define latitude validations
  const departureLatValidation = [new ValidationRule(validator.latitude, 'departureLat', voyage.departureLat, __('field_latitude_validation'))];

  //Define latitude direction
  const departureLatDirectionValidation = [new ValidationRule(validator.notEmpty, 'departureLatDirection', voyage.departureLatDirection, __('field_latitude_direction'))];
  const departureLongDirectionValidation = [new ValidationRule(validator.notEmpty, 'departureLongDirection', voyage.departureLongDirection, __('field_longitude_direction'))];
  const departureLatDirectionInvalid = [new ValidationRule(validator.invalidLatDirection, 'departureLatDirection', voyage.departureLatDirection, __('field_latitude_value'))];
  const departureLongDirectionInvalid = [new ValidationRule(validator.invalidLongDirection, 'departureLongDirection', voyage.departureLongDirection, __('field_longitude_value'))];
 

  // Define latitude validations
  const departureLongValidation = [new ValidationRule(validator.longitude, 'departureLong', voyage.departureLong, __('field_longitude_validation'))];

  const validations = [
    [new ValidationRule(validator.realDate, 'departureDate', departDateObj, __('field_departure_real_date_validation'))],
    [new ValidationRule(validator.currentOrFutureDate, 'departureDate', departDateObj, __('field_departure_date_too_far_in_future'))],
    [new ValidationRule(validator.dateNotTooFarInFuture, 'departureDate', departDateObj, __('field_departure_date_too_far_in_future'))],
    [new ValidationRule(validator.validTime, 'departureTime', departureTimeObj, __('field_departure_real_time_validation'))],
    [new ValidationRule(validator.notEmpty, 'portChoice', voyage.portChoice, __('field_port_choice_message'))],
  ];

  // Check if port code is ZZZZ then need to validate lat/long and display req zzzz message
  if (departPortObj.portCode.length > 4) {
    validations.push(
      departureLatValidation,
      departureLongValidation,
      departureLatDirectionValidation,
      departureLongDirectionValidation,
      departureLatDirectionInvalid,
      departureLongDirectionInvalid,
    );
  } else if (voyage.portChoice) {
    // if not just add port validation
    validations.push(
      departurePortValidation,
    );
  }

  return validations;
};

const performAPICall = (cookie, res, buttonClicked) => {
  garApi.patch(cookie.getGarId(), cookie.getGarStatus(), cookie.getGarDepartureVoyage())
    .then((apiResponse) => {
      const parsedResponse = JSON.parse(apiResponse);
      if (Object.prototype.hasOwnProperty.call(parsedResponse, 'message')) {
        // API returned error
        logger.debug(`Api returned: ${parsedResponse}`);
        res.render('app/garfile/departure/index', {
          cookie,
          errors: [parsedResponse],
        });
        return;
      }
      // Successful
      if (buttonClicked === 'Save and continue') {
        res.redirect('/garfile/arrival');
      } else {
        // Temporary redirect (307) so this POST also becomes a POST for garfile/view
        res.redirect(307, '/garfile/view');
      }
    })
    .catch((err) => {
      logger.error('Api failed to update GAR');
      logger.error(err);
      res.render('app/garfile/departure/index', {
        cookie,
        errors: [{
          message: 'Failed to add to GAR',
        }],
      });
    });
};

module.exports = async (req, res) => {
  logger.debug('In garfile / arrival post controller');

  const cookie = new CookieModel(req);
  const { buttonClicked } = req.body;

  // Define voyage
  const voyage = req.body;
  delete voyage.buttonClicked;
  // TODO: Update this once the intended 'unknown' port code is discovered.
  if (voyage.portChoice === 'No') {
    logger.debug("Testing departure Lat and Long values...");
    
    if (voyage.departureLatDirection && voyage.departureLatDirection.toUpperCase() == 'S') {
      const convertedLat = parseFloat(voyage.departureDegrees) + parseFloat((voyage.departureMinutes/60) + parseFloat((voyage.departureSeconds/3600).toFixed(6)));
      voyage.departureLat = '-' + parseFloat(convertedLat).toFixed(6);
    }
    else{
      const convertedLat = parseFloat(voyage.departureDegrees) + parseFloat((voyage.departureMinutes/60) + parseFloat((voyage.departureSeconds/3600).toFixed(6)));
      voyage.departureLat = parseFloat(convertedLat).toFixed(6);
    }
    
    if (voyage.departureLatDirection && voyage.departureLongDirection.toUpperCase() == 'W'){
      const convertedLong = parseFloat(voyage.departureLongDegrees) + parseFloat((voyage.departureLongMinutes/60) + parseFloat((voyage.departureLongSeconds/3600).toFixed(6)));
      voyage.departureLong = '-' + parseFloat(convertedLong).toFixed(6);
    }
    else{
      const convertedLong = parseFloat(voyage.departureLongDegrees) + parseFloat((voyage.departureLongMinutes/60) + parseFloat((voyage.departureLongSeconds/3600).toFixed(6)));
      voyage.departureLong = parseFloat(convertedLong).toFixed(6);
    }

    logger.debug(voyage.departureLat);
    logger.debug(voyage.departureLong);
    const combinedCoordinates = voyage.departureLat.toString() + " " + voyage.departureLong.toString();
    voyage.departurePort = combinedCoordinates;
    logger.debug(voyage.departurePort);
  } else {
    // If 'Yes' is selected then clear the coordinate values
    voyage.departureLat = '';
    voyage.departureLong = '';
    voyage.departurePort = _.toUpper(voyage.departurePort);
  }
  cookie.setGarDepartureVoyage(voyage);

  const validations = createValidationChains(voyage);

  const gar = await garApi.get(cookie.getGarId());

  validations.push(
    [
      new ValidationRule(validator.notSameValues, 'departurePort', [voyage.departurePort, JSON.parse(gar).arrivalPort], __('field_same_departure_port_validation')),
    ],
  );

  // The entry below is a surplus as there's already same validation at the Arrival port section //
 // validations.push([
  //  new ValidationRule(airportValidation.isBritishAirport, 'departurePort', [voyage.departurePort, JSON.parse(gar).arrivalPort], airportValidation.notBritishMsg),
 // ]);
 
  validator.validateChains(validations)
    .then(() => {
      performAPICall(cookie, res, buttonClicked);
    })
    .catch((err) => {
      logger.info('GAR departure validation failed');
      logger.debug(JSON.stringify(err));
      res.render('app/garfile/departure/index', { cookie, errors: err });
    });
};
