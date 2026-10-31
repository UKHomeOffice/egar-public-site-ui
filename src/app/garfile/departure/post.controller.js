const logger = require('../../../common/utils/logger')(__filename);
const validator = require('../../../common/utils/validator');
const CookieModel = require('../../../common/models/Cookie.class');
const { garApi } = require('../../../common/services/dataAccessApi');
const ValidationRule = require('../../../common/models/ValidationRule.class');

const createValidationChains = (voyage) => {
  // Create validation input objs
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
    new ValidationRule(
      validator.notEmpty,
      'departurePort',
      voyage.departurePort,
      __('field_departure_port_code_validation')
    ),
    new ValidationRule(
      validator.isValidAirportCode,
      'departurePort',
      voyage.departurePort,
      'Departure port should be an ICAO or IATA code'
    ),
  ];

  // Define latitude validations
  const departureLatValidation = [
    new ValidationRule(validator.latitude, 'departureLat', voyage.departureLat, __('field_latitude_validation')),
  ];

  // Define latitude validations
  const departureLongValidation = [
    new ValidationRule(validator.longitude, 'departureLong', voyage.departureLong, __('field_longitude_validation')),
  ];

  const validations = [
    [
      new ValidationRule(
        validator.realDate,
        'departureDate',
        departDateObj,
        __('field_departure_real_date_validation')
      ),
    ],
    [
      new ValidationRule(
        validator.currentOrPastDate,
        'departureDate',
        departDateObj,
        __('field_departure_date_should_not_be_in_the_past')
      ),
    ],
    [
      new ValidationRule(
        validator.validTime,
        'departureTime',
        departureTimeObj,
        __('field_departure_real_time_validation')
      ),
    ],
    [new ValidationRule(validator.notEmpty, 'portChoice', voyage.portChoice, __('field_port_choice_message'))],
  ];

  if (voyage.portChoice === 'Yes') {
    validations.push(departurePortValidation);
  } else {
    validations.push(departureLatValidation, departureLongValidation);
  }

  return validations;
};

const performAPICall = (cookie, res, buttonClicked) => {
  return garApi
    .patch(res.locals.gar.garId, cookie.getGarStatus(), cookie.getGarDepartureVoyage())
    .then((apiResponse) => {
      if (Object.prototype.hasOwnProperty.call(apiResponse, 'message')) {
        // API returned error
        res.render('app/garfile/departure/index', {
          cookie,
          errors: [apiResponse],
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
      logger.error('Failed to update GAR', {
        garId: cookie.getGarId(),
        errorMessage: err?.message,
        stack: err?.stack,
      });
      res.render('app/garfile/departure/index', {
        cookie,
        errors: [
          err?.type === 'http_error' && typeof err.body?.message === 'string'
            ? err.body
            : { message: 'Failed to add to GAR' },
        ],
      });
    });
};

module.exports = async (req, res) => {
  const cookie = new CookieModel(req);
  const { buttonClicked } = req.body;

  // Define voyage
  const voyage = req.body;
  delete voyage.buttonClicked;
  if (voyage.portChoice === 'Yes') {
    voyage.departureLat = '';
    voyage.departureLong = '';
    // Note: Comment this out when we have the new aiport list ready.
    // const port = findByCode(voyage.departurePort);
    // voyage.departurePortCode = port?.value || '';
    // voyage.departurePortDesc = port?.name || null;
  } else {
    voyage.departurePort = voyage.departureLat + ' ' + voyage.departureLong;
  }

  cookie.setGarDepartureVoyage(voyage);

  const validations = createValidationChains(voyage);

  validations.push([
    new ValidationRule(
      validator.notSameValues,
      'departurePort',
      [voyage.departurePort, res.locals.gar.arrivalPort],
      __('field_same_departure_port_validation')
    ),
  ]);

  return validator
    .validateChains(validations)
    .then(() => {
      return performAPICall(cookie, res, buttonClicked);
    })
    .catch((err) => {
      logger.warn('GAR departure validation failed', { garId: cookie.getGarId() });
      res.render('app/garfile/departure/index', { cookie, errors: err });
    });
};
