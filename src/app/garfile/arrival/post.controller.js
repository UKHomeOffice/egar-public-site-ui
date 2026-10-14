const logger = require('../../../common/utils/logger')(__filename);
const validator = require('../../../common/utils/validator');
const CookieModel = require('../../../common/models/Cookie.class');
const garApi = require('../../../common/services/garApi');
const ValidationRule = require('../../../common/models/ValidationRule.class');
const airportValidation = require('../../../common/utils/airportValidation');

const performAPICall = (cookie, buttonClicked, res) => {
  garApi
    .patch(res.locals.gar.garId, cookie.getGarStatus(), {
      ...cookie.getGarArrivalVoyage(),
      isInbound: cookie.getIsInbound(),
    })
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
      logger.error('Failed to update GAR', {
        garId: cookie.getGarId(),
        errorMessage: err?.message,
        stack: err?.stack,
      });
      res.render('app/garfile/arrival/index', {
        cookie,
        errors: [
          {
            message: 'Failed to add to GAR',
          },
        ],
      });
    });
};

const buildValidations = (voyage) => {
  // Create validation input objs
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
    new ValidationRule(
      validator.isValidAirportCode,
      'arrivalPort',
      voyage.arrivalPort,
      'Arrival port should be an ICAO or IATA code'
    ),
  ];

  const arrivalLatValidation = [
    new ValidationRule(validator.latitude, 'arrivalLat', voyage.arrivalLat, __('field_latitude_validation')),
  ];
  const arrivalLongValidation = [
    new ValidationRule(validator.longitude, 'arrivalLong', voyage.arrivalLong, __('field_longitude_validation')),
  ];

  const validations = [
    [new ValidationRule(validator.realDate, 'arrivalDate', arriveDateObj, __('field_arrival_date_validation'))],
    [
      new ValidationRule(
        validator.currentOrPastDate,
        'arrivalDate',
        arriveDateObj,
        __('field_arrival_date_too_far_in_future')
      ),
    ],
    [
      new ValidationRule(
        validator.dateNotMoreThanMonthInFuture,
        'arrivalDate',
        arriveDateObj,
        __('field_arrival_date_too_far_in_future')
      ),
    ],
    [new ValidationRule(validator.validTime, 'arrivalTime', arrivalTimeObj, __('field_arrival_time_validation'))],
    [new ValidationRule(validator.notEmpty, 'portChoice', voyage.portChoice, __('field_port_choice_message'))],
  ];

  if (voyage.portChoice === 'Yes') {
    validations.push(arrivalPortValidation);
  } else {
    validations.push(arrivalLatValidation, arrivalLongValidation);
  }

  return validations;
};

module.exports = async (req, res) => {
  const cookie = new CookieModel(req);
  const { buttonClicked } = req.body;

  // Define voyage
  const voyage = req.body;
  delete voyage.buttonClicked;

  if (voyage.portChoice === 'Yes') {
    voyage.arrivalLat = '';
    voyage.arrivalLong = '';
    // NOTE: Comment this out when we finally have the new Airport list ready.
    // const port = findByCode(voyage.arrivalPort);
    // voyage.arrivalPortDesc = port?.name || port?.name || null;
    // voyage.arrivalPort = port?.value || '';
  } else {
    voyage.arrivalPort = `${voyage.arrivalLat} ${voyage.arrivalLong}`;
  }
  cookie.setGarArrivalVoyage(voyage);

  const validations = buildValidations(voyage);

  const gar = await garApi.get(res.locals.gar.garId);
  const departurePort = JSON.parse(gar).departurePort;
  validations.push([
    new ValidationRule(
      validator.notSameValues,
      'arrivalPort',
      [voyage.arrivalPort, departurePort],
      __('field_arrival_port_different_departure')
    ),
  ]);

  if (voyage.portChoice === 'Yes') {
    validations.push([
      new ValidationRule(
        airportValidation.includesOneBritishAirport,
        'arrivalPort',
        [voyage.arrivalPort, departurePort],
        airportValidation.notBritishMsg
      ),
    ]);
  }

  const isInbound = airportValidation.isJourneyUKInbound(departurePort, voyage.arrivalPort);
  cookie.setIsInbound(isInbound);

  validator
    .validateChains(validations)
    .then(() => {
      performAPICall(cookie, buttonClicked, res);
    })
    .catch((err) => {
      logger.warn('GAR arrival validation failed', { garId: cookie.getGarId() });
      res.render('app/garfile/arrival/index', {
        cookie,
        errors: err,
      });
    });
};
