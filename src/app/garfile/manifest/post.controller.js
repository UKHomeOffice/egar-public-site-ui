const logger = require('../../../common/utils/logger');
const CookieModel = require('../../../common/models/Cookie.class');
const { Manifest } = require('../../../common/models/Manifest.class');
const garApi = require('../../../common/services/garApi');

module.exports = (req, res) => {
  const cookie = new CookieModel(req);
  logger.debug('In garfile / manifest post controller');
  if (req.body.editPersonId) {
    req.session.editPersonId = req.body.editPersonId;
    res.redirect('/garfile/manifest/editperson');
  } else if (req.body.deletePersonId) {
    req.session.deletePersonId = req.body.deletePersonId;
    res.redirect('/garfile/manifest/deleteperson');
  } else if (req.body.addPersonId) {
    req.session.addPersonId = req.body.addPersonId;
    res.redirect('/garfile/manifest/addnewperson');
  } else if (req.body.buttonClicked === 'Save and Exit') {
    res.redirect('/garfile/manifest');
  }
    else if (req.body.buttonClicked === 'Save and Continue') {
    // Perform manifest validation then redirect to next section
    garApi.getPeople(cookie.getGarId())
      .then((apiResponse) => {
        const manifest = new Manifest(apiResponse);
        if (manifest.validate()) {
          return res.redirect('/garfile/responsibleperson');
        }
        logger.info('Manifest validation failed, redirecting with error msg');
        req.session.manifestErr = manifest.genErrValidations();
        req.session.manifestInvalidPeople = manifest.invalidPeople;
        return res.redirect('/garfile/manifest');
      })
      .catch((err) => {
        logger.error('Failed to get manifest');
        logger.error(err);
        req.session.manifestErr = 'Failed to get manifest';
        return res.redirect('/garfile/manifest');
      });
  }
};
