const logger = require('../../common/utils/logger')(__filename);
const CookieModel = require('../../common/models/Cookie.class');
const tokenApi = require('../../common/services/tokenApi');
const garApi = require('../../common/services/garApi');

const PAGE_ONE = 1;
const PER_PAGE = 10;
const INITIAL_GARS_PER_PAGE = 50;

module.exports = (req, res) => {
  logger.debug('In register / reguser get controller');
  const cookie = new CookieModel(req);

  const userId = cookie.getUserDbId();
  const role = cookie.getUserRole();
  const orgId = cookie.getOrganisationId();

  // Delete any GAR stored in the cookie session
  cookie.session.gar = null;

  const statusTab = req.query?.status || 'Draft,Submitted,Cancelled';
  let pageVal = req.query?.page || PAGE_ONE;

  //Override the per-page value to load more table rows initially, so the gars data can be distributed across different tabs when the page first loads.
  const perPage = statusTab === 'Draft,Submitted,Cancelled' ? INITIAL_GARS_PER_PAGE : PER_PAGE;

  tokenApi
    .getLastLogin(cookie.getUserEmail())
    .then((userSession) => {
      const { successHeader, successMsg } = req.session;

      const pageObj = { page: pageVal, perPage: perPage, status: statusTab };
      delete req.session.successHeader;
      delete req.session.successMsg;

      garApi
        .getGars(userId, role, pageObj, orgId)
        .then(async (apiResponse) => {
          const garList = JSON.parse(apiResponse).items;

          if (Object.keys(req.query).length === 0) {
            req.session.garList = garList;
          }

          const draftGarsList = req.session.garList.filter((gar) => {
            if (gar.status.name === 'Draft') {
              return gar;
            }
          });

          const submittedGarsList = req.session.garList.filter((gar) => {
            if (gar.status.name === 'Submitted') {
              return gar;
            }
          });
          const cancelledGarsList = req.session.garList.filter((gar) => {
            if (gar.status.name === 'Cancelled') {
              return gar;
            }
          });
          const draftGars = req.query.status === 'Draft' ? garList : draftGarsList;
          const submittedGars = req.query.status === 'Submitted' ? garList : submittedGarsList;
          const cancelledGars = req.query.status === 'Cancelled' ? garList : cancelledGarsList;
          const garsCountObj = await garApi.getGarsCount(userId, role, orgId);
          res.render('app/home/index', {
            cookie,
            userSession,
            successMsg,
            successHeader,
            pageMetadata: getPageMetadata(garsCountObj, pageVal, statusTab),
            statusTab,
            garList,
            draftGars,
            submittedGars,
            cancelledGars,
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
            garsCountObj: {},
          });
        });
    })
    .catch((err) => {
      logger.error(err);
      return res.render('app/home/index', { cookie, userSession: [] });
    });
};

/**
 *
 * @param {*} garsCount
 * @param {*} pageNum
 * @param {*} statusTab
 * @returns pagingObject with pagination metadata for each tab
 */
function getPageMetadata(garsCount, pageNum, statusTab) {
  const pagingObject = {};
  for (const status in garsCount) {
    const totalPages = Math.ceil(garsCount[status] / PER_PAGE);
    const page = status !== statusTab ? PAGE_ONE : pageNum;
    pagingObject[`${status}`] = {
      page: page,
      perPage: PER_PAGE,
      totalPages: totalPages,
      totalItems: garsCount[status],
    };
  }
  return pagingObject;
}
