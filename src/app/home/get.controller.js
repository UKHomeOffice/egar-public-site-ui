const logger = require('../../common/utils/logger')(__filename);
const CookieModel = require('../../common/models/Cookie.class');
const tokenApi = require('../../common/services/tokenApi');
const garApi = require('../../common/services/garApi');

const PAGE_ONE = 1;
const PER_PAGE = 10;

module.exports = (req, res) => {
  logger.debug('In register / reguser get controller');
  const cookie = new CookieModel(req);

  const userId = cookie.getUserDbId();
  const role = cookie.getUserRole();
  const orgId = cookie.getOrganisationId();

  // Delete any GAR stored in the cookie session
  cookie.session.gar = null;

  const statusTab = req.query?.status || 'Draft';
  let pageVal = req.query?.page || PAGE_ONE;

  tokenApi
    .getLastLogin(cookie.getUserEmail())
    .then(async (userSession) => {
      const { successHeader, successMsg } = req.session;
      const draftPageObj =
        statusTab === 'Draft'
          ? { page: pageVal, perPage: PER_PAGE, status: 'Draft' }
          : { page: PAGE_ONE, perPage: PER_PAGE, status: 'Draft' };

      const submittedPageObj =
        statusTab === 'Submitted'
          ? { page: pageVal, perPage: PER_PAGE, status: 'Submitted' }
          : { page: PAGE_ONE, perPage: PER_PAGE, status: 'Submitted' };

      const cancelledPageObj =
        statusTab === 'Cancelled'
          ? { page: pageVal, perPage: PER_PAGE, status: 'Cancelled' }
          : { page: PAGE_ONE, perPage: PER_PAGE, status: 'Cancelled' };

      delete req.session.successHeader;
      delete req.session.successMsg;
      try {
        const draftGars = JSON.parse(await garApi.getGars(userId, role, draftPageObj, orgId));
        const submittedGars = JSON.parse(await garApi.getGars(userId, role, submittedPageObj, orgId));
        const cancelledGars = JSON.parse(await garApi.getGars(userId, role, cancelledPageObj, orgId));
        res.render('app/home/index', {
          cookie,
          userSession,
          successMsg,
          successHeader,
          statusTab,
          draftGars,
          submittedGars,
          cancelledGars,
        });
      } catch (error) {
        logger.error('Failed to get GARS from API');
        logger.error(error);
        res.render('app/home/index', {
          cookie,
          successMsg,
          successHeader,
          errors: [{ message: 'Failed to get GARs' }],
          statusTab,
        });
      }
    })

    .catch((err) => {
      logger.error(err);
      return res.render('app/home/index', { cookie, userSession: [] });
    });
};
