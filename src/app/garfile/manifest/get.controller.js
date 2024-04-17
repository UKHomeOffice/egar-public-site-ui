const logger = require('../../../common/utils/logger')(__filename);
const CookieModel = require('../../../common/models/Cookie.class');
const { Manifest } = require('../../../common/models/Manifest.class');
const personApi = require('../../../common/services/personApi');
const garApi = require('../../../common/services/garApi');


module.exports = async (req, res) => {
  const cookie = new CookieModel(req);
  logger.debug('In garfile / manifest get controller');

  const userId = cookie.getUserDbId();
  const garId = cookie.getGarId();

  const getSavedPeople = personApi.getPeople(userId, 'individual');
  const getManifest = garApi.getPeople(garId);

  try {
    const values = await Promise.all([getSavedPeople, getManifest]);
    const savedPeople = JSON.parse(values[0]);
    const manifest = JSON.parse(values[1]);
    const manifestData = new Manifest(values[1]);
    const isValidManifest = await manifestData.validate();

    logger.info(`Session: ${JSON.stringify(req.session)}`);
    logger.info(`req.session.errMsg: ${req.session.errMsg}`);
    logger.info(`req.session.manifestErr: ${req.session.manifestErr}`);

      if (req.session.errMsg) {
        const { errMsg } = req.session;
        delete req.session.errMsg;
        return res.render('app/garfile/manifest/index', { cookie, savedPeople, manifest, errors: [errMsg] });
      }

      if (req.session.manifestErr) {
        const { manifestErr, manifestInvalidPeople } = req.session;
        delete req.session.manifestErr;
        delete req.session.manifestInvalidPeople;
        return res.render('app/garfile/manifest/index', { cookie, savedPeople, manifest, manifestInvalidPeople, errors: manifestErr });
      }

      if (!isValidManifest) {
        logger.info('Manifest validation failed, redirecting with error msg');
    
        return res.render('app/garfile/manifest/index', { 
          cookie, 
          savedPeople, 
          manifest, 
          manifestInvalidPeople: manifestData.invalidPeople, 
          errors: manifestData.genErrValidations()
        });
      }

      if (req.session.successMsg) {
        const { successMsg } = req.session;
        delete req.session.successMsg;
        return res.render('app/garfile/manifest/index', { cookie, savedPeople, manifest, successMsg });
      }
      return res.render('app/garfile/manifest/index', { cookie, savedPeople, manifest });
    } catch(err) {
      // Get savedpeople / manifest failed
      logger.error('Failed to add person to GAR');
      logger.error(err);
      res.render('app/garfile/manifest/index', { cookie, errors: [{ message: 'Failed to get manifest data' }] });
    };
};
