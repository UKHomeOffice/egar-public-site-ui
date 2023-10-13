const logger = require('../../common/utils/logger')(__filename);
const CookieModel = require('../../common/models/Cookie.class');
const tokenApi = require('../../common/services/tokenApi');
const garApi = require('../../common/services/garApi');

module.exports = (req, res) => {
  logger.debug('In register / reguser get controller');
  const cookie = new CookieModel(req);

  const userId = cookie.getUserDbId();
  const role = cookie.getUserRole();
  const orgId = cookie.getOrganisationId();

  // Delete any GAR stored in the cookie session
  cookie.session.gar = null;

  tokenApi.getLastLogin(cookie.getUserEmail())
    .then((userSession) => {
      const { successHeader, successMsg } = req.session;
      delete req.session.successHeader;
      delete req.session.successMsg;

      garApi.getGars(userId, role, orgId)
        .then((apiResponse) => {
          const garList = JSON.parse(apiResponse).items;
          const draftGars = garList.filter(gar => gar.status.name === 'Draft');
          const submittedGars = garList.filter(gar => gar.status.name === 'Submitted');
          const cancelledGars = garList.filter(gar => gar.status.name === 'Cancelled');
          res.render('app/home/index', {
            cookie,
            userSession,
            successMsg,
            successHeader,
            draftGars,
            submittedGars,
            cancelledGars
          });
        })
        .catch((err) => {
          logger.error('Failed to get GARS from API');
          logger.error(err);
          res.render('app/home/index', {
            cookie, successMsg, successHeader, errors: [{ message: 'Failed to get GARs' }],
          });
        });
    })
    .catch((err) => {
      logger.error(err);
      return res.render('app/home/index', { cookie, userSession: [] });
    });
};
