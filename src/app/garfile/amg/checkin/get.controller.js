import loggerFactory from '../../../../common/utils/logger.js';
const logger = loggerFactory(import.meta.url);
import CookieModel from '../../../../common/models/Cookie.class.js';
import manifestFields from '../../../../common/seeddata/gar_manifest_fields.json' with { type: "json"};
import garApi from '../../../../common/services/garApi.js';

export default (req, res) => {
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

    const renderObj = {
      cookie,
      manifestFields,
      garfile,
      garpeople,
      garsupportingdocs,
      showChangeLinks: true,
      statusCheckComplete,
    };

    res.render(template, renderObj);

  }).catch((err) => {
    logger.error('Error retrieving GAR for amg');
    logger.error(err);
    res.render('app/garfile/amg/checkin/index', { cookie, errors: [{ message: 'There was an error retrieving the GAR. Try again later' }] });
  });
};
