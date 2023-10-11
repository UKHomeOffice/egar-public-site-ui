const logger = require('../../../../common/utils/logger')(__filename);
const CookieModel = require('../../../../common/models/Cookie.class');
const manifestFields = require('../../../../common/seeddata/gar_manifest_fields.json');
const garApi = require('../../../../common/services/garApi');

module.exports = (req, res) => {
  logger.debug('In garfile / amg get controller');

  const cookie = new CookieModel(req);
  const garId = cookie.getGarId();
  const template = req.query.template==='pane' ? 'app/garfile/amg/departurestatus/pane' : 'app/garfile/amg/departurestatus/index';

  Promise.all([
    garApi.get(garId),
    garApi.getPeople(garId),
  ]).then((apiResponse) => {
    const garfile = JSON.parse(apiResponse[0]);
    const garpeople = JSON.parse(apiResponse[1]);

    const renderObj = {
      cookie,
      manifestFields,
      garfile,
      garpeople,
    };

    res.render(template, renderObj);

  }).catch((err) => {
    logger.error('Error retrieving GAR for amg');
    logger.error(JSON.stringify(err));
    res.render('app/home/index', { cookie, errors: [{ message: 'There was an error retrieving the GAR. Try again later' }] });
  });
};
