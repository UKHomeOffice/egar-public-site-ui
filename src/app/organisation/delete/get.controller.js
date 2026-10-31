const CookieModel = require('../../../common/models/Cookie.class');
const logger = require('../../../common/utils/logger')(__filename);
const { userManageApi, organisationApi } = require('../../../common/services/dataAccessApi');

module.exports = async (req, res) => {
  const cookie = new CookieModel(req);
  const errMsg = { message: 'Failed to delete user. Try again' };

  try {
    const requesterId = cookie.getUserDbId();
    const organisationId = cookie.getOrganisationId();
    const deleteUserEmail = req.session.deleteUserId;
    delete req.session.deleteUserId;

    if (deleteUserEmail === undefined) {
      res.redirect('/organisation');
      return;
    }

    const userToDelete = await userManageApi.getDetails(deleteUserEmail);

    const apiResponse = await organisationApi.deleteUser(requesterId, organisationId, {
      userId: userToDelete.userId,
      firstName: userToDelete.firstName,
      lastName: userToDelete.lastName,
      role: userToDelete.role.name,
    });

    if (Object.prototype.hasOwnProperty.call(apiResponse, 'message')) {
      req.session.errMsg = errMsg;
      return req.session.save(() => res.redirect('/organisation'));
    }
    req.session.successHeader = 'Success';
    req.session.successMsg = 'User deleted';
    return req.session.save(() => res.redirect('/organisation'));
  } catch (err) {
    logger.error('Failed to delete organisation user', {
      organisationId: cookie.getOrganisationId(),
      errorMessage: err?.message,
      stack: err?.stack,
    });
    req.session.errMsg = errMsg;
    return req.session.save(() => res.redirect('/organisation'));
  }
};
