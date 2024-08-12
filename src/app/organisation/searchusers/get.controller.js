const CookieModel = require('../../../common/models/Cookie.class');
const logger = require('../../../common/utils/logger')(__filename);
const organisationApi = require('../../../common/services/organisationApi');


const permissionLevels = {
  'User': 0,
  'Manager': 1,
  'Admin': 2
};

module.exports = (req, res) => {
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
      req.session.errMsg = { message: 'Failed to find user details. Try again' };
      return res.redirect('/organisation');
    });
};







