const logger = require('../../../common/utils/logger')(__filename);
const garApi = require('../../../common/services/garApi');
const CookieModel = require('../../../common/models/Cookie.class');
const manifestFields = require('../../../common/seeddata/gar_manifest_fields.json');
const { Manifest } = require('../../../common/models/Manifest.class');
const emailService = require('../../../common/services/sendEmail');
const config = require('../../../common/config');
const ValidationRule = require('../../../common/models/ValidationRule.class');
const validator = require('../../../common/utils/validator');
const airportValidation = require('../../../common/utils/airportValidation');
const validationList = require('./validations');
const { log } = require('winston');

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
      emailService.send(config.NOTIFY_GAR_SUBMISSION_TEMPLATE_ID, cookie.getUserEmail(), {
        firstName: cookie.getUserFirstName(),
        garId: cookie.getGarId(),
      }).then(() => {
        res.render('app/garfile/submit/success/index', {
          cookie,
        });
      }).catch(() => {
        logger.error('Error occurred invoking emailService, but GAR has been submitted');
        res.render('app/garfile/submit/success/index', {
          cookie,
          errors: [{ message: 'There was an issue sending a confirmation email, but the GAR should be submitted' }],
        });
      });
    }).catch((err) => {
      logger.error('Api failed to update GAR');
      logger.error(err);
      res.render('app/garfile/submit/failure/index', {
        cookie,
      });
    });
};

const buildValidations = (garfile, garpeople, manifest) => {
  const validations = validationList.validations(garfile, garpeople);

  // Manifest specific validations does not using generic mechanism, so wrapped in
  // an uninformative message for now
  if (!manifest.validate()) {
    const validateFailMsg = 'Resolve manifest errors before submitting';
    validations.push([
      new ValidationRule(validator.valuetrue, 'resolveError', '', validateFailMsg),
    ]);
  }

  if (!manifest.validateCaptainCrew()) {
    const validateCaptainCrewMsg = 'There must be at least one captain or crew member on the voyage';
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
  ]).then((responseValues) => {
    const garfile = JSON.parse(responseValues[0]);
    validator.handleResponseError(garfile);

    const garpeople = JSON.parse(responseValues[1]);
    const manifest = new Manifest(responseValues[1]);
    validator.handleResponseError(garpeople);

    const garsupportingdocs = JSON.parse(responseValues[2]);
    validator.handleResponseError(garsupportingdocs);

    const validations = buildValidations(garfile, garpeople, manifest);

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
     logger.error('Status: ' + garfile.status.name);
     logger.error('isJourneyUKInbound: ' + airportValidation.isJourneyUKInbound(garfile.departurePort, garfile.arrivalPort));

      if (airportValidation.isJourneyUKInbound(garfile.departurePort, garfile.arrivalPort) && garfile.status.name !== 'StatusCheckComplete') {
        logger.error('about to run performAPICallAMG');
        performAPICallAMG(garId, cookie, req, res);
      }
      else {
        logger.error('about to run performAPICall');
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
    logger.error(JSON.stringify(err));
    res.render('app/garfile/review/index', { cookie, errors: [{ message: 'There was an error retrieving the GAR. Try again later' }] });
  });
};
