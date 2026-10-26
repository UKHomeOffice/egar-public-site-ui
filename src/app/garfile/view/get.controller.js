const CookieModel = require('../../../common/models/Cookie.class');
const logger = require('../../../common/utils/logger')(__filename);
const garApi = require('../../../common/services/data-access/garApi');
const manifestFields = require('../../../common/seeddata/gar_manifest_fields.json');
const airportValidation = require('../../../common/utils/airportValidation');
const { isAbleToCancelGar } = require('../../../common/utils/validator');
const { garApi: facadeGarApi } = require('../../../common/services/dataAccessApi');

module.exports = async (req, res) => {
  const cookie = new CookieModel(req);
  let renderContext = {};
  logger.debug('In garfile/view get controller');
  const garId = cookie.getGarId();

  try {
    const [garPeople, garDetails, garDocs, progress] = await Promise.all([
      facadeGarApi.getPeople(garId),
      facadeGarApi.get(garId),
      facadeGarApi.getSupportingDocs(garId),
      facadeGarApi.getGarCheckinProgress(garId),
    ]);

    const resubmitted = req.query.resubmitted;
    const isResubmitted = cookie.getResubmitFor0T().includes(garId);

    if ('poll' in req.query) {
      logger.debug(`User GAR ${garId}: check-in progress status is ${progress}`);
      res.json(progress);
      return;
    }

    renderContext = {
      cookie,
      manifestFields,
      garfile: {},
      garpeople: {},
      garsupportingdocs: {},
    };

    try {
      const parsedGar = garDetails;
      const parsedPeople = garPeople;
      const supportingDocuments = garDocs;
      const { departureDate, departureTime } = parsedGar;
      const lastDepartureDateString = departureDate && departureTime ? `${departureDate}T${departureTime}.000Z` : null;
      const durationInDeparture = garApi.getDurationBeforeDeparture(departureDate, departureTime);
      const numberOf0TResponseCodes = (await facadeGarApi.getPeople(garId, '', '0T'))?.items?.length;

      cookie.setGarStatus(parsedGar.status.name);
      logger.debug(`Retrieved GAR ID: ${parsedGar.garId}`);

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
        isAbleToCancelGar: isAbleToCancelGar(lastDepartureDateString),
        garpeople: parsedPeople,
        garsupportingdocs: supportingDocuments,
        successMsg,
        successHeader,
        isJourneyUKInbound: airportValidation.isJourneyUKInbound(parsedGar.departurePort, parsedGar.arrivalPort),
        resubmitted,
        durationInDeparture,
        numberOf0TResponseCodes,
        isResubmitted,
      };
      renderContext.showChangeLinks = true;
      if (parsedGar.status.name === 'Submitted' || parsedGar.status.name === 'Cancelled') {
        renderContext.showChangeLinks = false;
      }

      if (progress === 'Incomplete' && resubmitted === 'yes') {
        logger.debug('Rendering GAR 0T resubmit page');
        res.render('app/garfile/amg/checkin/resubmit', renderContext);
      } else {
        logger.debug('Rendering GAR review page');
        res.render('app/garfile/view/index', renderContext);
      }
    } catch (err) {
      logger.error('Failed to get GAR information', { garId, errorMessage: err?.message, stack: err?.stack });
      renderContext.errors = [{ message: 'Failed to get GAR information' }];
      res.render('app/garfile/view/index', renderContext);
    }
  } catch (err) {
    logger.error('Failed to get GAR information', { garId, errorMessage: err?.message, stack: err?.stack });
    renderContext.errors = [{ message: 'Failed to get GAR information' }];
    res.render('app/garfile/view/index', renderContext);
  }
};
