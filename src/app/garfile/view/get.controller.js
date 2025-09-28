import CookieModel from '../../../common/models/Cookie.class.js';
import loggerFactory from '../../../common/utils/logger.js';
const logger = loggerFactory(import.meta.url);
import garApi from '../../../common/services/garApi.js';
import manifestFields from '../../../common/seeddata/gar_manifest_fields.json' with { type: "json"};
import airportValidation from '../../../common/utils/airportValidation.js';
import validator from '../../../common/utils/validator.js';

/**
 * For a supplied GAR object, check that the user id or organisation id
 * match the given parameters. Returns true if there is a match or false
 * otherwise.
 *
 * @param {Object} parsedGar The GAR to check
 * @param {String} userId The user id to check against
 * @param {String} organisationId The organisation to check against
 */
const checkGARUser = (parsedGar, userId, organisationId) => {
 if (parsedGar === undefined || parsedGar === null) return false;

 if ((parsedGar.organisationId && organisationId) && parsedGar.organisationId === organisationId) {
   logger.info('GAR organisation id matches current user ID');
   return true;
 }
 if (parsedGar.userId === userId) {
   logger.info('GAR user id matches current user ID');
   return true;
 }
 return false;
};

export default (req, res) => {
    const cookie = new CookieModel(req);
    logger.debug('In garfile/view get controller');
    
    const context = { cookie };

    let { garId } = req.body;
    if (garId === undefined) {
      garId = cookie.getGarId();
    }
    cookie.setGarId(garId);
    const garPeople = garApi.getPeople(garId);
    const garDetails = garApi.get(garId);
    const garDocs = garApi.getSupportingDocs(garId);

    let renderContext = {
      cookie,
      manifestFields,
      garfile: {},
      garpeople: {},
      garsupportingdocs: {},
    };

  Promise.all([garDetails, garPeople, garDocs])
    .then((responseValues) => {
      const parsedGar = JSON.parse(responseValues[0]);
      const parsedPeople = JSON.parse(responseValues[1]);
      const supportingDocuments = JSON.parse(responseValues[2]);
      const { departureDate, departureTime } = parsedGar;
      const lastDepartureDateString = departureDate && departureTime ? `${departureDate}T${departureTime}.000Z`: null;

      // Do the check here
      if (!checkGARUser(parsedGar, cookie.getUserDbId(), cookie.getOrganisationId())) {
        logger.error(`Detected an attempt by user id: ${cookie.getUserDbId()} to access GAR with id: ${parsedGar.garId} which does not match userId or organisationId! Returning to dashboard.`);
        res.redirect('/home');
        return;
      }

      cookie.setGarId(parsedGar.garId);
      cookie.setGarStatus(parsedGar.status.name);
      logger.info(`Retrieved GAR id: ${parsedGar.garId}`);

      // Maybe not necessary but delete the ids as the template does not need them
      delete parsedGar.userId;
      delete parsedGar.organisationId;
      const { successMsg, successHeader } = req.session;
      delete req.session.successHeader;
      delete req.session.successMsg;

      renderContext = {
        cookie,
        manifestFields,
        garfile: parsedGar,
        isAbleToCancelGar: validator.isAbleToCancelGar(lastDepartureDateString),
        garpeople: parsedPeople,
        garsupportingdocs: supportingDocuments,
        successMsg,
        successHeader,
        isJourneyUKInbound: airportValidation.isJourneyUKInbound(parsedGar.departurePort, parsedGar.arrivalPort)
      }; 
      renderContext.showChangeLinks = true;
      if ((parsedGar.status.name === 'Submitted') || parsedGar.status.name === 'Cancelled') {
        renderContext.showChangeLinks = false;
      }
      logger.info('Rendering GAR review page');
      res.render('app/garfile/view/index', renderContext);
    })
    .catch((err) => {
      logger.error('Failed to get GAR information');
      logger.error(err);
      renderContext.errors = [{ message: 'Failed to get GAR information' }];
      res.render('app/garfile/view/index', renderContext);
    });
  };