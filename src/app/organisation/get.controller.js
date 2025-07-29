
const { json } = require('body-parser');
const CookieModel = require('../../common/models/Cookie.class');
const orgApi = require('../../common/services/organisationApi');
const logger = require('../../common/utils/logger')(__filename);
const pagination = require('../../common/utils/pagination');
const {permissionLevels} = require('../../common/utils/permissionLevels');

module.exports = (req, res) => {
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
