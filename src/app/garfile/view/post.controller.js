const logger = require('../../../common/utils/logger')(__filename);
const CookieModel = require('../../../common/models/Cookie.class');
const manifestFields = require('../../../common/seeddata/gar_manifest_fields.json');
const garApi = require('../../../common/services/garApi');
const dataAccessApi = require('../../../common/services/dataAccessApi');
const { isAbleToCancelGar } = require('../../../common/utils/validator');
const { hasGARSubmittedForPassengerChecks } = require('../../../common/utils/utils');

module.exports = async (req, res) => {
  const cookie = new CookieModel(req);
  const garId = cookie.getGarId();

  let numberOf0TResponseCodes = 0;
  const isResubmitted = cookie.getResubmitFor0T().includes(garId);

  let renderContext = {
    cookie,
    manifestFields,
    garfile: {},
    garpeople: {},
    garsupportingdocs: {},
    numberOf0TResponseCodes,
  };

  try {
    const [garPeople, garDetails, garDocs] = await Promise.all([
      dataAccessApi.garApi.getPeople(garId),
      dataAccessApi.garApi.get(garId, true),
      dataAccessApi.garApi.getSupportingDocs(garId),
    ]);

    const parsedGar = garDetails;
    const parsedPeople = garPeople;
    const supportingDocuments = garDocs;
    const { departureDate, departureTime } = parsedGar;
    const lastDepartureDateString = departureDate && departureTime ? `${departureDate}T${departureTime}.000Z` : null;

    // Do the check here
    if (parsedGar?.message) {
      logger.error(`Gar not found : ${parsedGar.garId}.`);
      res.redirect('/home');
      return;
    }

    numberOf0TResponseCodes = (parsedPeople.items || []).filter((x) => x.amgCheckinResponseCode === '0T').length;
    const durationInDeparture = garApi.getDurationBeforeDeparture(parsedGar.departureDate, parsedGar.departureTime);
    const passengerChecks = (parsedPeople.items || []).filter((x) => x.amgCheckinResponseCode !== null);
    cookie.setCbpId(parsedGar.cbpId);
    cookie.setGarStatus(parsedGar.status.name);
    logger.debug(`Retrieved GAR ID: ${parsedGar.garId}`);

    // Maybe not necessary but delete the ids as the template does not need them
    delete parsedGar.userId;
    delete parsedGar.organisationId;

    renderContext = {
      cookie,
      manifestFields,
      garfile: parsedGar,
      isAbleToCancelGar: isAbleToCancelGar(lastDepartureDateString),
      garpeople: parsedPeople,
      garsupportingdocs: supportingDocuments,
      showChangeLinks: true,
      isJourneyUKInboundWithPassengerChecks: parsedGar.isInbound && hasGARSubmittedForPassengerChecks(parsedPeople),
      numberOf0TResponseCodes,
      durationInDeparture,
      isResubmitted,
    };

    if (parsedGar.status.name === 'Submitted' || parsedGar.status.name === 'Cancelled') {
      renderContext.showChangeLinks = false;
    }

    logger.debug('Rendering GAR review page');
    res.render('app/garfile/view/index', renderContext);
  } catch (err) {
    logger.error('Failed to get GAR information', { garId, errorMessage: err?.message, stack: err?.stack });
    renderContext.errors = [{ message: 'Failed to get GAR information' }];
    res.render('app/garfile/view/index', renderContext);
  }
};
