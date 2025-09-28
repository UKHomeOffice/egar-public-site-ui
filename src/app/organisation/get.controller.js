
// import { json } from 'body-parser';
import CookieModel from '../../common/models/Cookie.class.js';
import orgApi from '../../common/services/organisationApi.js';
import loggerFactory from '../../common/utils/logger.js';
const logger = loggerFactory(import.meta.url);
import pagination from '../../common/utils/pagination.js';
import permissionLevels from '../../common/utils/permissionLevels.js';

export default (req, res) => {
  logger.debug('In organisation get controller');
  const cookie = new CookieModel(req);
 
  const errMSg = { message: 'Failed to get orgusers' };
  const userPermissions = permissionLevels[cookie.getUserRole()];
  const currentPage = pagination.getCurrentPage(req, '/organisation');
  
  orgApi.getUsers(cookie.getOrganisationId(), currentPage)
    .then((values) => {
      const orgUsers = JSON.parse(values).items.map((orgUser) => {
        const isEditable = userPermissions > permissionLevels[orgUser.role.name];
        return { ...orgUser, isEditable };
      });

      const { totalPages, totalItems } = JSON.parse(values)._meta;
      const paginationData = pagination.build(req, totalPages, totalItems);
      cookie.setOrganisationUsers(orgUsers);

      if (req.session.errMsg) {
        const { errMsg } = req.session;
        delete req.session.errMsg;
        return res.render('app/organisation/index', { cookie, orgUsers, pages: paginationData , currentPage: currentPage, errors: [errMsg]});
      }
      if (req.session.successMsg) {
        const { successMsg, successHeader } = req.session;
        delete req.session.successHeader;
        delete req.session.successMsg;
        return res.render('app/organisation/index', {
          cookie, orgUsers, successHeader, successMsg, pages: paginationData, currentPage: currentPage
        });
      }

      return res.render('app/organisation/index', { cookie, orgUsers, pages: paginationData, currentPage: currentPage });
    })
    .catch((err) => {
      logger.error('There was an error fetching users for the organisation');
      logger.error(err);
      res.render('app/organisation/index', { cookie, errors: [{ message: 'There was a problem fetching organisation users' }] });
    });
};
