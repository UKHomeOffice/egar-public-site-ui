const CookieModel = require('../../../common/models/Cookie.class');
const logger = require('../../../common/utils/logger')(__filename);
const garApi = require('../../../common/services/garApi');
const manifestFields = require('../../../common/seeddata/gar_manifest_fields.json');

module.exports = (req, res) => {
  const cookie = new CookieModel(req);
  logger.debug('In garfile/print manifest get controller');
  const garId = cookie.getGarId();

  const garPeople = garApi.getPeople(garId);
  const garDetails = garApi.get(garId, true);
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

      cookie.setGarStatus(parsedGar.status.name);
      logger.info(`Retrieved GAR id: ${parsedGar.garId}`);

      // Maybe not necessary but delete the ids as the template does not need them
      delete parsedGar.userId;
      delete parsedGar.organisationId;

      renderContext = {
        cookie,
        manifestFields,
        garfile: parsedGar,
        garpeople: parsedPeople,
        garsupportingdocs: supportingDocuments,
      };
      renderContext.showChangeLinks = true;
      if (parsedGar.status.name === 'Submitted' || parsedGar.status.name === 'Cancelled') {
        renderContext.showChangeLinks = false;
      }
      logger.info('Rendering GAR review page');
      res.render('app/garfile/printmanifest/index', renderContext);
    })
    .catch((err) => {
      logger.error('Failed to get GAR information');
      logger.error(err);
      renderContext.errors = [{ message: 'Failed to get GAR information' }];
      res.render('app/garfile/printmanifest/index', renderContext);
    });
};
