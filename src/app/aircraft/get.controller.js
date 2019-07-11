const CookieModel = require('../../common/models/Cookie.class');
const logger = require('../../common/utils/logger')(__filename);
const craftApi = require('../../common/services/craftApi');

module.exports = (req, res) => {
  logger.debug('In user aircraft get controller');
  const cookie = new CookieModel(req);
  const crafts = cookie.getUserRole() === 'Individual' ? craftApi.getCrafts(cookie.getUserDbId()) : craftApi.getOrgCrafts(cookie.getOrganisationId());
  crafts.then((values) => {
    const savedCrafts = JSON.parse(values);
    cookie.setSavedCraft(savedCrafts);
    if (req.session.errMsg) {
      const { errMsg } = req.session;
      delete req.session.errMsg;
      return res.render('app/aircraft/index', { cookie, savedCrafts, errors: [errMsg] });
    }
    if (req.session.successMsg) {
      const { successMsg, successHeader } = req.session;
      delete req.session.successHeader;
      delete req.session.successMsg;
      return res.render('app/aircraft/index', {
        cookie, savedCrafts, successMsg, successHeader,
      });
    }
    return res.render('app/aircraft/index', { cookie, savedCrafts });
  }).catch((err) => {
    logger.error('There was an error fetching craft data for an individual');
    logger.error(err);
    res.render('app/aircraft/index', { cookie, errors: [{ message: 'There was a problem fetching data' }] });
  });
};
