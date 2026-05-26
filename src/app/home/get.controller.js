const logger = require('../../common/utils/logger')(__filename);
const CookieModel = require('../../common/models/Cookie.class');
const tokenApi = require('../../common/services/tokenApi');
const garApi = require('../../common/services/garApi');
const PER_PAGE = 10;
const PAGE_ONE = 1;

module.exports = (req, res) => {
  logger.debug('In register / reguser get controller');
  const cookie = new CookieModel(req);

  const userId = cookie.getUserDbId();
  const role = cookie.getUserRole();
  const orgId = cookie.getOrganisationId();

  // Delete any GAR stored in the cookie session
  cookie.session.gar = null;

  const statusTab = req.query?.status || 'Draft';

  tokenApi
    .getLastLogin(cookie.getUserEmail())
    .then((userSession) => {
      const { successHeader, successMsg } = req.session;
      const pageVal = req?.query?.page || PAGE_ONE;

      const pageObj = { page: pageVal, per_page: PER_PAGE, status: statusTab };
      delete req.session.successHeader;
      delete req.session.successMsg;

      garApi
        .getGars(userId, role, pageObj, orgId)
        .then(async (apiResponse) => {
          const garList = JSON.parse(apiResponse).items;
          const garsCountObj = await garApi.getGarsCount(userId, role, orgId);
          res.render('app/home/index', {
            cookie,
            userSession,
            successMsg,
            successHeader,
            pages: JSON.parse(apiResponse)._meta,
            statusTab,
            garList,
            garsCountObj,
          });
        })
        .catch((err) => {
          logger.error('Failed to get GARS from API');
          logger.error(err);
          res.render('app/home/index', {
            cookie,
            successMsg,
            successHeader,
            errors: [{ message: 'Failed to get GARs' }],
            statusTab,
            garsCountObj: 0,
          });
        });
    })
    .catch((err) => {
      logger.error(err);
      return res.render('app/home/index', { cookie, userSession: [] });
    });
};
