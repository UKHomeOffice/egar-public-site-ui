import CookieModel from '../../../common/models/Cookie.class.js';
import loggerFactory from '../../../common/utils/logger.js';
const logger = loggerFactory(import.meta.url);
import organisationApi from '../../../common/services/organisationApi.js';
import permissionLevels from '../../../common/utils/permissionLevels.js';

export default (req, res) => {
  const cookie = new CookieModel(req);
  logger.debug('In organisation / search organisation user controller');
  const errMsg = { message: 'Failed to fetch user. Try again' };
  const userPermissions = permissionLevels[cookie.getUserRole()];
  const { searchUserName } = req.query;
    
  if (searchUserName === undefined) {
    res.redirect('/organisation');
    return;
  }
  
  organisationApi.getSearchOrgUsers(cookie.getOrganisationId(), searchUserName)
    .then((apiResponse) => {
      const orgUsers = JSON.parse(apiResponse).map((orgUser) => {
        const isEditable = userPermissions > permissionLevels[orgUser.role.name];
        return { ...orgUser, isEditable };
      });
      cookie.setOrganisationUsers(orgUsers);
      
      return res.render('app/organisation/index', { cookie, orgUsers, searchUserName });
    })
    .catch((err) => {
      logger.error(err);
      req.session.errMsg = errMsg;
      return res.redirect('/organisation');
    });
};
