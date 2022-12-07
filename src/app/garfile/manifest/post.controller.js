const logger = require('../../../common/utils/logger')(__filename);
const CookieModel = require('../../../common/models/Cookie.class');
const { Manifest } = require('../../../common/models/Manifest.class');
const garApi = require('../../../common/services/garApi');
const personApi = require('../../../common/services/personApi');
const manifestUtil = require('./bulkAdd');

module.exports = (req, res) => {
  const cookie = new CookieModel(req);
  const { buttonClicked } = req.body;

  logger.debug('In garfile / manifest post controller');
  if (req.body.editPersonId) {
    req.session.editPersonId = req.body.editPersonId;
    req.session.save(() => res.redirect('/garfile/manifest/editperson'));
  } else if (req.body.deletePersonId) {
    req.session.deletePersonId = req.body.deletePersonId;
    req.session.save(() => res.redirect('/garfile/manifest/deleteperson'));
  } else if (req.body.personId && buttonClicked === 'Add to GAR') {
    logger.debug('Found people to add to manifest');
    manifestUtil.getDetailsByIds(req.body.personId, cookie.getUserDbId())
      .then((selectedPeople) => {
        garApi.patch(cookie.getGarId(), 'Draft', { people: selectedPeople })
          .then(() => {
            res.redirect('/garfile/manifest');
          })
          .catch(() => {
            logger.info('Failed to patch GAR with updated manifest');
            res.redirect('/garfile/manifest');
          });
      })
      .catch(() => {
        logger.info('Failed to retrieve manifest ids');
        res.redirect('/garfile/manifest');
      });
  } else if (req.body.buttonClicked === 'Save and Exit') {
    res.redirect('/garfile/manifest');
  } else if (req.body.buttonClicked === 'Continue') {
    // Perform manifest validation then redirect to next section
    garApi.getPeople(cookie.getGarId())
      .then((apiResponse) => {
        const manifest = new Manifest(apiResponse);
        if (manifest.validate()) {
          res.redirect('/garfile/responsibleperson');
          return;
        }
        logger.info('Manifest validation failed, redirecting with error msg');
        req.session.manifestErr = manifest.genErrValidations();
        req.session.manifestInvalidPeople = manifest.invalidPeople;
        res.redirect('/garfile/manifest');
      })
      .catch((err) => {
        logger.error('Failed to get manifest');
        logger.error(err);
        req.session.manifestErr = 'Failed to get manifest';
        res.redirect('/garfile/manifest');
      });
  } else {
    res.redirect('/garfile/manifest');
  }
};
