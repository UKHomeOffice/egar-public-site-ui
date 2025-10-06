const logger = require('../../../../common/utils/logger')(__filename);
const CookieModel = require('../../../../common/models/Cookie.class');
const manifestFields = require('../../../../common/seeddata/gar_manifest_fields.json');
const garApi = require('../../../../common/services/garApi');
const pagination = require('../../../../common/utils/pagination');

module.exports = async (req, res) => {
  logger.debug('In garfile / amg get controller');

  const cookie = new CookieModel(req);
  const garId = cookie.getGarId();
  const resubmitted = req.query.resubmitted;
  const template = req.query.template === 'pane' ? 'app/garfile/amg/checkin/pane' : 'app/garfile/amg/checkin/index';
  
  const currentPage = pagination.getCurrentPage(req, `/garfile/amg/checkin`);
  const {progress} = JSON.parse(await garApi.getGarCheckinProgress(garId));
  if ( 'poll' in req.query) {
      logger.info(
        `User GAR ${garId}: Checkin progress status is ${progress}`,
      );
      res.json(progress);
      return;
    }
  Promise.all([
    garApi.get(garId),
    garApi.getPeople(garId, currentPage),
    garApi.getSupportingDocs(garId)
  ]).then(async (apiResponse) => {
    const garfile = JSON.parse(apiResponse[0]);
    const garpeople = JSON.parse(apiResponse[1]);
    const garsupportingdocs = JSON.parse(apiResponse[2]);
    const numberOf0TResponseCodes = garpeople.items.filter(x => x.amgCheckinResponseCode === '0T').length;
    const statusCheckComplete = garpeople.items.every(x => x.amgCheckinStatus.name === 'Complete');

    
    const durationInDeparture = garApi.getDurationBeforeDeparture(garfile.departureDate, garfile.departureTime);

    const { totalPages, totalItems } = garpeople._meta;
    const paginationData = pagination.build(req, totalPages, totalItems);
   

    
    const showImportantBanner = (statusCheckComplete && resubmitted === 'no' && numberOf0TResponseCodes > 0 && durationInDeparture > 125 );
  


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
      pages: paginationData, currentPage: currentPage,
      showImportantBanner
    };

     if (progress === 'Incomplete') {
      return res.render('app/garfile/amg/checkin/resubmit', renderObj);
    }
  
    res.render(template, renderObj);
    

  }).catch((err) => {
    logger.error('Error retrieving GAR for amg');
    logger.error(err);
    res.render('app/garfile/amg/checkin/index', { cookie, errors: [{ message: 'There was an error retrieving the GAR. Try again later' }] });
  });
};
