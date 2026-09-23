const logger = require('../../common/utils/logger')(__filename);
const CookieModel = require('../../common/models/Cookie.class');
const dataAccessApi = require('../../common/services/dataAccessApi');

const PAGE_ONE = 1;
const PER_PAGE = 10;

module.exports = async (req, res) => {
  const cookie = new CookieModel(req);

  const userId = cookie.getUserDbId();
  const role = cookie.getUserRole();
  const orgId = cookie.getOrganisationId();

  // Delete any GAR stored in the cookie session
  cookie.session.gar = null;

  const statusTab = req.query?.status || 'Draft';
  const pageVal = req.query?.page || PAGE_ONE;

  const { successHeader, successMsg } = req.session;
  const getPageObj = (status) => ({
    page: statusTab === status ? pageVal : PAGE_ONE,
    perPage: PER_PAGE,
    status,
  });
  const draftPageObj = getPageObj('Draft');
  const submittedPageObj = getPageObj('Submitted');
  const cancelledPageObj = getPageObj('Cancelled');

  delete req.session.successHeader;
  delete req.session.successMsg;

  try {
    const [draftGars, submittedGars, cancelledGars] = await Promise.all([
      dataAccessApi.garApi.getGars(userId, role, draftPageObj, orgId),
      dataAccessApi.garApi.getGars(userId, role, submittedPageObj, orgId),
      dataAccessApi.garApi.getGars(userId, role, cancelledPageObj, orgId),
    ]);

    res.render('app/home/index', {
      cookie,
      successMsg,
      successHeader,
      statusTab,
      draftGars,
      submittedGars,
      cancelledGars,
    });
  } catch (error) {
    logger.error('Failed to get GARS from API', { errorMessage: error?.message, stack: error?.stack });
    res.render('app/home/index', {
      cookie,
      successMsg,
      successHeader,
      errors: [{ message: 'Failed to get GARs' }],
      statusTab,
    });
  }
};
