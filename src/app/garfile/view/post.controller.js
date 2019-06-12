const logger = require('../../../common/utils/logger')(__filename);
const CookieModel = require('../../../common/models/Cookie.class');
const manifestFields = require('../../../common/seeddata/gar_manifest_fields.json');
const garApi = require('../../../common/services/garApi');

module.exports = (req, res) => {
  logger.debug('In garfile / view post controller');
  const cookie = new CookieModel(req);
  const garId = req.body.garId;
  cookie.setGarId(req.body.garId);
  const userId = cookie.getUserDbId();
  const garPeople = garApi.getPeople(garId);
  const garDetails = garApi.get(garId);
  const garDocs = garApi.getSupportingDocs(garId);

  let renderContext = {
    cookie,
    manifestFields,
    garfile: {},
    garpeople: [],
    garDocs: {},
  };

  Promise.all([garDetails, garPeople, garDocs])
    .then((responseValues) => {
      const parsedGar = JSON.parse(responseValues[0]);
      const parsedPeople = JSON.parse(responseValues[1]);
      const supportingDocuments = JSON.parse(responseValues[2]);
      cookie.setGarId(parsedGar.garId);
      cookie.setGarStatus(parsedGar.status.name);
      logger.info(`Retrieved GAR id: ${parsedGar.garId}`);
      renderContext = {
        cookie,
        manifestFields,
        garfile: parsedGar,
        garpeople: parsedPeople,
        supportingdocs: supportingDocuments,
      };
      if ((parsedGar.status.name === 'Submitted') || parsedGar.status.name === 'Cancelled') {
        logger.info('Rendering submitted GAR review page');
        return res.render('app/garfile/view/submitted', renderContext);
      }
      logger.info('Rendering unsubmitted GAR review page');
      renderContext.showChangeLinks = true;
      return res.render('app/garfile/view/unsubmitted', renderContext);
    })
    .catch((err) => {
      logger.error('Failed to get GAR information');
      logger.error(err);
      res.render('app/garfile/view/submitted', { cookie, renderContext, errors: [{ message: 'Failed to get GAR information' }] });
    });
};
