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
  cookie.setGarDepartureVoyage(voyage);

  // Define not empty validations
  const validationIds = ['departurePort'];
  const validationValues = [voyage.departurePort];
  const validationMsgs = ['Enter an departure port'];

  // Define port / date validation msgs
  const portMsg = 'If you do not have the airport code, enter \'ZZZZ\' and enter the latitude and longitude to 4 decimal places below.';
  const portCodeMsg = 'The departure airport code must be a minimum of 3 letters and a maximum of 4 letters.';
  const futureDateMsg = 'Departure date must be today or in the future';
  const realDateMsg = 'Enter a real Departure date';
  const timeMsg = 'Enter a real Departure time';
  const latitudeMsg = 'Value entered is incorrect. Enter latitude to 4 decimal places.';
  const longitudeMsg = 'Value entered is incorrect. Enter longitude to 4 decimal places.';

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

  // Define port / date validations
  const departurePortValidation = [
    new ValidationRule(validator.validatePortCoords, 'departurePort', departPortObj, portMsg),
    new ValidationRule(validator.validPort, 'departurePort', voyage.departurePort, portCodeMsg),
  ];

  // Define blank port validations
  const departurePortBlank = [new ValidationRule(validator.notEmpty, 'departurePort', voyage.departurePort, portMsg)];

  // Define latitude validations
  const departureLatValidation = [new ValidationRule(validator.lattitude, 'departureLat', voyage.departureLat, latitudeMsg)];

  // Define latitude validations
  const departureLongValidation = [new ValidationRule(validator.longitude, 'departureLong', voyage.departureLong, longitudeMsg)];

  const validations = [
    [
      new ValidationRule(validator.realDate, 'departureDate', departDateObj, realDateMsg),
    ],
    [
      new ValidationRule(validator.currentOrFutureDate, 'departureDate', departDateObj, futureDateMsg),
    ],
    [
      new ValidationRule(validator.validTime, 'departureTime', departureTimeObj, timeMsg),
    ],
    // [
    //   new ValidationRule(validator.notEmpty, validationIds, validationValues, validationMsgs),
    // ],
  ];

  // Check if port is blank
  if (voyage.departurePort.length === 0) {
    validations.push(
      departurePortBlank,
    );
  }

  // Check if port code is ZZZZ or blank as then need to validate lat/long
  if (departPortObj.portCode.toUpperCase() === 'ZZZZ' || voyage.departurePort.length === 0) {
    validations.push(
      departureLatValidation,
      departureLongValidation,
    );
  } else {
    // if not just add port validation
    validations.push(
      departurePortValidation,
    );
  }

  validator.validateChains(validations)
    .then(() => {
      garApi.patch(cookie.getGarId(), cookie.getGarStatus(), cookie.getGarDepartureVoyage())
        .then((apiResponse) => {
          const parsedResponse = JSON.parse(apiResponse);
          if (parsedResponse.hasOwnProperty('message')) {
            // API returned error
            logger.debug(`Api returned: ${parsedResponse}`);
            res.render('app/garfile/departure/index', {
              cookie,
              errors: [parsedResponse],
            });
          } else {
            // Successful
            return buttonClicked === 'Save and continue' ? res.redirect('/garfile/arrival') : res.redirect('/home');
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
    })
    .catch((err) => {
      logger.info('Validation failed');
      logger.info(err);
      res.render('app/garfile/departure/index', {
        cookie,
        errors: err,
      });
    });
};
