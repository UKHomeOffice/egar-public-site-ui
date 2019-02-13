const logger = require('../../../common/utils/logger');
const garApi = require('../../../common/services/garApi');
const CookieModel = require('../../../common/models/Cookie.class');
const { Manifest } = require('../../../common/models/Manifest.class');
const emailService = require('../../../common/services/sendEmail');
const config = require('../../../common/config');

module.exports = (req, res) => {
  logger.debug('In garfile / review post controller');
  const cookie = new CookieModel(req);

  const garPeople = garApi.getPeople(cookie.getGarId());
  const garDetails = garApi.get(cookie.getGarId());

  // validatate gar to be submitted
  Promise.all([garDetails, garPeople])
    .then((responseValues) => {
      const parsedGar = JSON.parse(responseValues[0]);
      const parsedPeople = JSON.parse(responseValues[1]);
      const manifest = new Manifest(responseValues[1]);
      let flagGarValidated = false;

      req.session.submiterrormessage = [];

      if (!manifest.validate()) {
        req.session.submiterrormessage.push('Resolve manifest errors before submitting.');
      }

      if (!manifest.validateCaptainCrew()) {
        req.session.submiterrormessage.push('There must be at least one Captain or Crew member on the voyage. Please add one.');
      }

      if (!manifest.validate() || !manifest.validateCaptainCrew()) {
        return res.redirect('/garfile/review');
      }

      if (parsedGar.status.name.toLowerCase() === 'submitted') {
        req.session.submiterrormessage = 'This GAR has already been submitted';
        return res.redirect('/garfile/review');
      }

      if (parsedGar.registration !== null
          && parsedGar.arrivalDate !== null
          && parsedPeople.items !== null
          && parsedGar.responsibleGivenName !== null) {
        flagGarValidated = true;
      }

      if (flagGarValidated) {
        garApi
          .patch(cookie.getGarId(), 'Submitted', {})
          .then((apiResponse) => {
            logger.info('Received response from API');
            const parsedResponse = JSON.parse(apiResponse);
            if (!Object.prototype.hasOwnProperty.call(parsedResponse, 'message')) {
              logger.info('Successfully submitted GAR');
              cookie.setGarStatus('Submitted');
              emailService
                .send(config.NOTIFY_GAR_SUBMISSION_TEMPLATE_ID, cookie.getUserEmail(), {
                  firstName: cookie.getUserFirstName(),
                  garId: cookie.getGarId(),
                })
                .then(() => {
                  res.render('app/garfile/submit/success/index', { cookie });
                });
            } else {
              res.render('app/garfile/submit/failure/index', { cookie });
            }
          })
          .catch((err) => {
            logger.error('Failed to submit GAR');
            logger.error(err);
            res.render('app/garfile/submit/failure/index', { cookie, error: [{ message: 'GAR failed to submit' }] });
          });
      } else {
        logger.error('Failed to submit Incomplete GAR');
        req.session.submiterrormessage.push('Resolve manifest errors before submitting.');
        res.redirect('/garfile/review');
      }
    });
};
