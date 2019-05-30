const logger = require('../../../common/utils/logger')(__filename);
const validator = require('../../../common/utils/validator');
const CookieModel = require('../../../common/models/Cookie.class');
const garApi = require('../../../common/services/garApi');
const ValidationRule = require('../../../common/models/ValidationRule.class');

module.exports = async (req, res) => {
  logger.debug('In garfile / arrival post controller');

  const cookie = new CookieModel(req);
  const {
    buttonClicked,
  } = req.body;

  // Define voyage
  const voyage = req.body;
  delete voyage.buttonClicked;
  cookie.setGarDepartureVoyage(voyage);

  // Define port / date validation msgs
  const portMsg = 'As you have entered an arrival port code of "ZZZZ", you must provide longitude and latitude coordinates for the location';
  const portCodeMsg = 'The departure airport code must be a minimum of 3 letters and a maximum of 4 letters';
  const futureDateMsg = 'Departure date must be today or in the future';
  const realDateMsg = 'Enter a real departure date';
  const timeMsg = 'Enter a real departure time';
  const latitudeMsg = 'Value entered is incorrect. Enter latitude to 4 decimal places';
  const longitudeMsg = 'Value entered is incorrect. Enter longitude to 4 decimal places';
  const samePortMsg = 'Departure port must be different to arrival port';

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
    new ValidationRule(validator.validPort, 'departurePort', voyage.departurePort, portCodeMsg),
  ];

  // Define ZZZZ port validations
  const departurePortZZZZ = [new ValidationRule(validator.validatePortCoords, 'departurePort', departPortObj, portMsg)];

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
  ];

  // Check if port code is ZZZZ then need to validate lat/long and display req zzzz message
  if (departPortObj.portCode.toUpperCase() === 'ZZZZ') {
    validations.push(
      departurePortZZZZ,
      departureLatValidation,
      departureLongValidation,
    );
  } else {
    // if not just add port validation
    validations.push(
      departurePortValidation,
    );
  }

  const gar = await garApi.get(cookie.getGarId());

  validations.push(
    [
      new ValidationRule(validator.notSameValues, 'departurePort', [voyage.departurePort, JSON.parse(gar).arrivalPort], samePortMsg)
    ]
  )

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
