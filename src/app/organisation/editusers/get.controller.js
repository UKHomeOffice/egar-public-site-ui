const CookieModel = require('../../../common/models/Cookie.class');
const logger = require('../../../common/utils/logger')(__filename);
const orgApi = require('../../../common/services/organisationApi');
const roles = require('../../../common/seeddata/egar_user_roles');

module.exports = (req, res) => {
  const cookie = new CookieModel(req);
  const userId = req.session.editUserId;

  logger.debug('In organisation / editusers get controller');

  if (userId === undefined) {
    res.redirect('/organisation');
    return;
  }

  orgApi.getUsers(cookie.getOrganisationId())
    .then((apiResponse) => {
      const orgUsers = JSON.parse(apiResponse).items;
      const orgUser = orgUsers.find(user => user.userId === userId);
      if (orgUser !== undefined) {
        orgUser.role = orgUser.role.name;
      }
      return res.render('app/organisation/editusers/index', { cookie, orgUser, roles });
    })
    .catch((err) => {
      logger.error(err);
      req.session.errMsg = { message: 'Failed to find user details. Try again' };
      return res.redirect('/organisation');
    });
};
