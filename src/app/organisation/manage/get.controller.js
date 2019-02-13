const CookieModel = require('../../../common/models/Cookie.class');
const logger = require('../../../common/utils/logger');
const craftApi = require('../../../common/services/craftApi');
const personApi = require('../../../common/services/personApi');
const orgApi = require('../../../common/services/organisationApi');

module.exports = (req, res) => {
  logger.debug('In organisation / manage get controller');
  const cookie = new CookieModel(req);

  const orgId = cookie.getOrganisationId();
  const userId = cookie.getUserDbId();
  Promise.all([craftApi.getOrgCrafts(orgId), personApi.getPeople(userId, 'individual'), orgApi.getUsers(orgId)])
    .then((values) => {
      const savedCrafts = JSON.parse(values[0]);
      const savedPeople = JSON.parse(values[1]);
      const orgUsers = JSON.parse(values[2]);
      cookie.setOrganisationUsers(orgUsers);
      cookie.setSavedCraft(savedCrafts);
      cookie.setSavedPeople(savedPeople);
      if (req.session.errMsg) {
        const { errMsg } = req.session;
        delete req.session.errMsg;
        return res.render('app/organisation/manage/index', { cookie, savedCrafts, savedPeople, orgUsers, errors: [errMsg] });
      }
      if (req.session.successMsg) {
        const { successMsg, successHeader } = req.session;
        delete req.session.successHeader;
        delete req.session.successMsg;
        return res.render('app/organisation/manage/index', { cookie, savedCrafts, savedPeople, orgUsers, successHeader, successMsg });
      }
      return res.render('app/organisation/manage/index', { cookie, savedCrafts, savedPeople, orgUsers });
    })
    .catch((err) => {
      logger.error('There was an error fetching craft / people data for an organisation');
      logger.error(err);
      res.render('app/organisation/manage/index', { cookie, errors: [{ message: 'There was a problem fetching organisation data'}] });
    });
};
