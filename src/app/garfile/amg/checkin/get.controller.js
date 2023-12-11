const logger = require('../../../../common/utils/logger')(__filename);
const CookieModel = require('../../../../common/models/Cookie.class');
const manifestFields = require('../../../../common/seeddata/gar_manifest_fields.json');
const travelPermissionCodes = require('../../../../common/utils/travel_permission_codes.json');
const garApi = require('../../../../common/services/garApi');

module.exports = (req, res) => {
  logger.debug('In garfile / amg get controller');

  const cookie = new CookieModel(req);
  const garId = cookie.getGarId();
  const template = req.query.template==='pane' ? 'app/garfile/amg/checkin/pane' : 'app/garfile/amg/checkin/index';

  Promise.all([
    garApi.get(garId),
    garApi.getPeople(garId),
    garApi.getSupportingDocs(garId),
  ]).then((apiResponse) => {
    const garfile = JSON.parse(apiResponse[0]);
    const garpeople = JSON.parse(apiResponse[1]);
    const garsupportingdocs = JSON.parse(apiResponse[2]);

    const statusCheckComplete = garpeople.items.every(x => x.amgCheckinStatus.name === 'Complete');

    const passengers = garpeople.items.sort((garperson, b) => {
      const ORDER_FIRST = -1;
      const KEEP_ORDER = 0;
      return garperson.amgCheckinResponseCode === travelPermissionCodes["NO_BOARD"] ? ORDER_FIRST : KEEP_ORDER;
    })

    const renderObj = {
      cookie,
      manifestFields,
      garfile,
      passengers,
      garsupportingdocs,
      showChangeLinks: true,
      statusCheckComplete,
    };

    res.render(template, renderObj);

  }).catch((err) => {
    logger.error('Error retrieving GAR for amg');
    logger.error(JSON.stringify(err));
    res.render('app/garfile/amg/checkin/index', { cookie, errors: [{ message: 'There was an error retrieving the GAR. Try again later' }] });
  });
};
