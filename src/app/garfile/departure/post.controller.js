const _ = require('lodash');
const logger = require('../../../common/utils/logger')(__filename);
const validator = require('../../../common/utils/validator');
const CookieModel = require('../../../common/models/Cookie.class');
const garApi = require('../../../common/services/garApi');
const ValidationRule = require('../../../common/models/ValidationRule.class');

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

  // Define latitude validations
  const departureLongValidation = [new ValidationRule(validator.longitude, 'departureLong', voyage.departureLong, __('field_longitude_validation'))];

  const validations = [
    [new ValidationRule(validator.realDate, 'departureDate', departDateObj, __('field_departure_real_date_validation'))],
    [new ValidationRule(validator.currentOrFutureDate, 'departureDate', departDateObj, __('field_departure_date_validation'))],
    [new ValidationRule(validator.validTime, 'departureTime', departureTimeObj, __('field_departure_real_time_validation'))],
    [new ValidationRule(validator.notEmpty, 'portChoice', voyage.portChoice, __('field_port_choice_message'))],
  ];

  // Check if port code is ZZZZ then need to validate lat/long and display req zzzz message
  if (departPortObj.portCode.toUpperCase() === 'YYYY') {
    validations.push(
      departureLatValidation,
      departureLongValidation,
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
  if (voyage.departurePort === 'ZZZZ' || voyage.portChoice === 'No') {
    voyage.departurePort = 'YYYY';
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
