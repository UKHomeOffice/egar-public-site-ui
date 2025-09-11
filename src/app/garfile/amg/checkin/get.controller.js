const logger = require('../../../../common/utils/logger')(__filename);
const CookieModel = require('../../../../common/models/Cookie.class');
const manifestFields = require('../../../../common/seeddata/gar_manifest_fields.json');
const garApi = require('../../../../common/services/garApi');
const { getDurationBeforeDeparture } = require('../../../../common/utils/utils.js');

module.exports = async (req, res) => {
  logger.debug('In garfile / amg get controller');

  const cookie = new CookieModel(req);
  const garId = cookie.getGarId();
  const template = req.query.template === 'pane' ? 'app/garfile/amg/checkin/pane' : 'app/garfile/amg/checkin/index';
  const resubmitted = req.query.resubmitted;

  Promise.all([
    garApi.get(garId),
    garApi.getPeople(garId),
    garApi.getSupportingDocs(garId),
  ]).then(async (apiResponse) => {
    const garfile = JSON.parse(apiResponse[0]);
    const garpeople = JSON.parse(apiResponse[1]);
    const garsupportingdocs = JSON.parse(apiResponse[2]);
    const numberOf0TResponseCodes = garpeople.items.filter(x => x.amgCheckinResponseCode === '0T').length;
    const statusCheckComplete = garpeople.items.every(x => x.amgCheckinStatus.name === 'Complete');

    const progress = JSON.parse(await garApi.getGarCheckinProgress(garId));
    const durationInDeparture = getDurationBeforeDeparture(garfile.departureDate, garfile.departureTime);


    if ('poll' in req.query) {
      logger.info(
        `User GAR ${garId}: Checkin progress status is ${progress}`,
      );
      res.json(progress);
      return;
    }


    const renderObj = {
      cookie,
      manifestFields,
      garfile,
      garpeople,
      garsupportingdocs,
      showChangeLinks: true,
      statusCheckComplete,
      numberOf0TResponseCodes,
      resubmitted,
      durationInDeparture,
    };
    if (progress.progress === 'Incomplete') {
      res.render('app/garfile/amg/checkin/resubmit', renderObj);
    }
    else {
      res.render(template, renderObj);
    }

  }).catch((err) => {
    logger.error('Error retrieving GAR for amg');
    logger.error(err);
    res.render('app/garfile/amg/checkin/index', { cookie, errors: [{ message: 'There was an error retrieving the GAR. Try again later' }] });
  });
};
