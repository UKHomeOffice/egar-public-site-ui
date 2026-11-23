const CookieModel = require('../../../common/models/Cookie.class');
const logger = require('../../../common/utils/logger')(__filename);
const { organisationApi } = require('../../../common/services/dataAccessApi');
const { getRolesForAssigning } = require('../../../common/utils/utils');

module.exports = (req, res) => {
  const cookie = new CookieModel(req);
  const userId = req.session.editUserId;

  if (userId === undefined) {
    res.redirect('/organisation');
    return;
  }

  const roles = getRolesForAssigning(cookie.getUserRole());

  return organisationApi
    .getUserById(userId)
    .then((apiResponse) => {
      const orgUser = apiResponse === undefined ? undefined : { ...apiResponse, role: apiResponse.role.name };
      return res.render('app/organisation/editusers/index', { cookie, orgUser, roles });
    })
    .catch((err) => {
      logger.error('Failed to find org user details', {
        userId,
        errorMessage: err?.message,
        stack: err?.stack,
      });
      req.session.errMsg = { message: 'Failed to find user details. Try again' };
      return res.redirect('/organisation');
    });
};
