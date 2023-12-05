
const CookieModel = require('../../common/models/Cookie.class');
const orgApi = require('../../common/services/organisationApi');
const logger = require('../../common/utils/logger')(__filename);

permissionLevels = {
  'Individual': 0, 
  'User': 0, 
  'Manager': 1, 
  'Admin': 2
}

module.exports = (req, res) => {
  logger.debug('In organisation get controller');
  const cookie = new CookieModel(req);
  const errMSg = { message: 'Failed to get orgusers' };
  const userPermissions = permissionLevels[cookie.getUserRole()]

  orgApi.getUsers(cookie.getOrganisationId())
    .then((values) => {
      const orgUsers = JSON.parse(values).items.map((orgUser) => {
        const isEditable = userPermissions > permissionLevels[orgUser.role.name];
        return { ...orgUser, isEditable };
      });
      cookie.setOrganisationUsers(orgUsers);

      logger.info(`cookie email: ${cookie.getUserEmail()}`);

      if (req.session.errMsg) {
        const { errMsg } = req.session;
        delete req.session.errMsg;
        return res.render('app/organisation/index', { cookie, orgUsers, errors: [errMsg] });
      }
      if (req.session.successMsg) {
        const { successMsg, successHeader } = req.session;
        delete req.session.successHeader;
        delete req.session.successMsg;
        return res.render('app/organisation/index', {
          cookie, orgUsers, successHeader, successMsg,
        });
      }
      return res.render('app/organisation/index', { cookie, orgUsers });
    })
    .catch((err) => {
      logger.error('There was an error fetching users for the organisation');
      logger.error(err);
      res.render('app/organisation/index', { cookie, errors: [{ message: 'There was a problem fetching organisation users' }] });
    });
};
