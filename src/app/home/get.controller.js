const logger = require('../../common/utils/logger');
const CookieModel = require('../../common/models/Cookie.class');
const tokenApi = require('../../common/services/tokenApi');
const garApi = require('../../common/services/garApi');

module.exports = (req, res) => {
  logger.debug('In register / reguser get controller');
  const cookie = new CookieModel(req);

  const userId = cookie.getUserDbId();
  const role = cookie.getUserRole();
  const orgId = cookie.getOrganisationId();

  const garList = [];
  const context = { cookie, garList }

  tokenApi.getLastLogin(cookie.getUserEmail())
    .then((userSession) => {
      garApi.getGars(userId, role, orgId)
        .then((apiResponse) => {
          const garList = JSON.parse(apiResponse).items;
          const draftGars = garList.filter(gar => gar.status.name === 'Draft');
          const submittedGars = garList.filter(gar => gar.status.name === 'Submitted');
          const cancelledGars = garList.filter(gar => gar.status.name === 'Cancelled');
          res.render('app/home/index', { cookie, userSession, draftGars, submittedGars, cancelledGars });
        })
        .catch((err) => {
          logger.error('Failed to get GARS from API');
          logger.error(err);
          context.errors = [{ message: 'Failed to get GARs' }];
          res.render('app/home/index', context);
        });
    })
    .catch((err) => {
      logger.error(err);
      const userSession = [];
      return res.render('app/home/index', context, { userSession });
    });
};
