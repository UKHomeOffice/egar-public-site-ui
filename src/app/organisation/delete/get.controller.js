const CookieModel = require('../../../common/models/Cookie.class');
const logger = require('../../../common/utils/logger')(__filename);
const organisationApi = require('../../../common/services/organisationApi');
const userApi = require('../../../common/services/userManageApi')

module.exports = async (req, res) => {
  const cookie = new CookieModel(req);
  logger.debug('In organisation / delete get controller');
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

    const userToDelete = await userApi.getDetails(deleteUserEmail);

    const apiResponse = await organisationApi.deleteUser(requesterId, organisationId, {
      userId: userToDelete.userId,
      firstName: userToDelete.firstName,
      lastName: userToDelete.lastName,
      role: userToDelete.role.name,
    });

    const parsedResponse = JSON.parse(apiResponse);
    if (Object.prototype.hasOwnProperty.call(parsedResponse, 'message')) {
      req.session.errMsg = errMsg;
      return req.session.save(() => res.redirect('/organisation'));
    }
    req.session.successHeader = 'Success';
    req.session.successMsg = 'User deleted';
    return req.session.save(() => res.redirect('/organisation'));

  } catch (err) {
    logger.error(err);
    req.session.errMsg = errMsg;
    return req.session.save(() => res.redirect('/organisation'));
  }
};
