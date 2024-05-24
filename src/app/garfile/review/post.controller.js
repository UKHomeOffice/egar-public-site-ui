const logger = require('../../../common/utils/logger')(__filename);
const garApi = require('../../../common/services/garApi');
const CookieModel = require('../../../common/models/Cookie.class');
const manifestFields = require('../../../common/seeddata/gar_manifest_fields.json');
const { Manifest } = require('../../../common/models/Manifest.class');
const ValidationRule = require('../../../common/models/ValidationRule.class');
const validator = require('../../../common/utils/validator');
const airportValidation = require('../../../common/utils/airportValidation');
const validationList = require('./validations');

const performAPICallAMG = (garId, cookie, req, res) => {
  garApi.submitGARForCheckin(garId)
    .then((apiResponse) => {
      logger.info('Submiited GAR people to AMG checkin');
      res.redirect('/garfile/amg/checkin');
    }).catch((err) => {
      logger.error('Api failed to submit GAR people for AMG checkin');
      logger.error(err);
      res.render('app/garfile/review/index.njk', {
        cookie,
      });
    });
};


const performAPICall = (garId, cookie, req, res) => {
  garApi.patch(garId, 'Submitted', {})
    .then((apiResponse) => {

      logger.info('Received response from API');
      const parsedResponse = JSON.parse(apiResponse);

      if (Object.prototype.hasOwnProperty.call(parsedResponse, 'message')) {
        // API has returned an error so return a message for the user
        const submitError = {
          message: 'An error has occurred. Try again later',
          identifier: '',
        };
        req.session.submiterrormessage.push(submitError);
        logger.error('API has returned an unexpected response');
        logger.error(parsedResponse.message);
        req.session.save(() => res.redirect('/garfile/review'));
        return;
      }

      logger.info('Successfully submitted GAR');

      cookie.setGarStatus('Submitted');

      res.render('app/garfile/submit/success/index', {
        cookie,
      });

    }).catch((err) => {
      logger.error('Api failed to update GAR');
      logger.error(err);
      res.render('app/garfile/submit/failure/index', {
        cookie,
      });
    });
};

const buildValidations = async (garfile, garpeople, manifest) => {
  const validations = validationList.validations(garfile, garpeople);
  const departureDateParts = garfile.departureDate ? garfile.departureDate.split('-') : [];
  const departDateObj = {
    d: departureDateParts[2],
    m: departureDateParts[1],
    y: departureDateParts[0],
  };
 

  validations.push(
    [new ValidationRule(validator.realDate, 'departureDate', departDateObj, __('field_departure_real_date_validation'))],
    [new ValidationRule(validator.currentOrPastDate, 'departureDate', departDateObj, __('field_departure_date_should_not_be_in_the_past'))],
  );

  // Manifest specific validations does not using generic mechanism, so wrapped in
  // an uninformative message for now
  const isManifestValid = await manifest.validate();

  if (!isManifestValid) {
    const validateFailMsg = 'Resolve manifest errors before submitting';
    validations.push([
      new ValidationRule(validator.valuetrue, 'resolveError', '', validateFailMsg),
    ]);
  }

  if (!garfile.isMilitaryFlight && !manifest.validateCaptainCrew()) {
    const validateCaptainCrewMsg = __('has_no_crew_or_captains');
    validations.push([
      new ValidationRule(validator.valuetrue, 'manifest', '', validateCaptainCrewMsg),
    ]);
  }

  return validations;
};

module.exports = (req, res) => {
  logger.debug('In garfile / review post controller');
  const cookie = new CookieModel(req);
  const garId = cookie.getGarId();

  // Validate GAR to be submitted
  Promise.all([
    garApi.get(garId),
    garApi.getPeople(garId),
    garApi.getSupportingDocs(garId),
  ]).then(async (responseValues) => {
    const garfile = JSON.parse(responseValues[0]);
    validator.handleResponseError(garfile);

    const garpeople = JSON.parse(responseValues[1]);
    const manifest = new Manifest(responseValues[1]);
    validator.handleResponseError(garpeople);

    const statuscheck = Boolean(req.body.statuscheck);

    const garsupportingdocs = JSON.parse(responseValues[2]);
    validator.handleResponseError(garsupportingdocs);

    const validations = await buildValidations(garfile, garpeople, manifest);

    if (garfile.status.name.toLowerCase() === 'submitted') {
      const submitError = {
        message: 'This GAR has already been submitted',
        identifier: '',
      };
      req.session.submiterrormessage.push(submitError);
      logger.info('GAR already submitted');
      req.session.save(() => res.redirect('/garfile/review'));
      return;
    }

    const renderObj = {
      cookie,
      manifestFields,
      garfile,
      garpeople,
      garsupportingdocs,
      showChangeLinks: true,
    };

    validator.validateChains(validations).then(() => {
      /*
        when we reach this point, if it is a journey coming into the UK we send them to AMG/UPT, otherwise we submit the GAR.
        when the UPT process is complete it sends them back here with status=StatusCheckComplete and at that stage we allow them to submit the GAR.
        - Journey is not coming into UK from outside: Submit GAR
        - Journey is coming into UK but no status check: Send to AMG/UPT
        - Journey is coming into UK and status check: Submit GAR
      */
     const isRequiresPassengerCheck = (
        airportValidation.isJourneyUKInbound(garfile.departurePort, garfile.arrivalPort) 
        && !statuscheck
      )

      const isAnAllMilitaryFlight = (
        garfile.isMilitaryFlight 
        && garpeople.items.length === 0
      );

      if (isRequiresPassengerCheck && !isAnAllMilitaryFlight) {
        performAPICallAMG(garId, cookie, req, res);
      } else {
        performAPICall(garId, cookie, req, res);
      }
    }).catch((err) => {

      logger.info('Failed to submit incomplete GAR - validation failed');
      logger.debug(JSON.stringify(err));
      renderObj.errors = err;
      res.render('app/garfile/review/index', renderObj);
    });
  }).catch((err) => {
    logger.error('Error retrieving GAR for review');
    logger.error(err);
    res.render('app/garfile/review/index', { cookie, errors: [{ message: 'There was an error retrieving the GAR. Try again later' }] });
  });
};
