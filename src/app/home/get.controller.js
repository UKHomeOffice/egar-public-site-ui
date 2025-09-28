import loggerFactory from '../../common/utils/logger.js';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const logger = loggerFactory(__filename);
import CookieModel from '../../common/models/Cookie.class.js';
import tokenApi from '../../common/services/tokenApi.js';
import garApi from '../../common/services/garApi.js';

export default (req, res) => {
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
      const page = req?.query?.page || 1;
      delete req.session.successHeader;
      delete req.session.successMsg;

      garApi.getGars(userId, role, page, orgId)
        .then((apiResponse) => {
          const garList = JSON.parse(apiResponse).items;
          const draftGars = garList.filter(gar => gar.status.name === 'Draft');
          const submittedGars = garList.filter(gar => gar.status.name === 'Submitted');
          const cancelledGars = garList.filter(gar => gar.status.name === 'Cancelled');
          const serverPagination = JSON.parse(apiResponse)._meta;

          res.render('app/home/index', {
            cookie,
            userSession,
            successMsg,
            successHeader,
            draftGars,
            submittedGars,
            cancelledGars,
            pageSize: 10, 
            serverPagination
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
