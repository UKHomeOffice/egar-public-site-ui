const CookieModel = require('../../../common/models/Cookie.class');
const logger = require('../../../common/utils/logger');
const craftApi = require('../../../common/services/craftApi');
const personApi = require('../../../common/services/personApi');

module.exports = (req, res) => {
  logger.debug('In user / viewDetails get controller');
  const cookie = new CookieModel(req);
  const userId = cookie.getUserDbId();
  Promise.all([craftApi.getCrafts(userId), personApi.getPeople(userId, 'individual')])
    .then((values) => {
      const savedCrafts = JSON.parse(values[0]);
      const savedPeople = JSON.parse(values[1]);
      cookie.setSavedCraft(savedCrafts);
      cookie.setSavedPeople(savedPeople);
      if (req.session.errMsg) {
        const { errMsg } = req.session;
        delete req.session.errMsg;
        return res.render('app/user/viewDetails/index', { cookie, savedCrafts, savedPeople, errors: [errMsg] });
      }
      if (req.session.successMsg) {
        const { successMsg, successHeader } = req.session;
        delete req.session.successHeader;
        delete req.session.successMsg;
        return res.render('app/user/viewDetails/index', { cookie, savedCrafts, savedPeople, successHeader, successMsg });
      }
      return res.render('app/user/viewDetails/index', { cookie, savedCrafts, savedPeople });
    })
    .catch((err) => {
      logger.error('There was an error fetching craft / people data for an individual');
      logger.error(err);
      res.render('app/user/viewDetails/index', { cookie, errors: [{ message: 'There was a problem fetching data' }] });
    });
};
