const CookieModel = require('../../../common/models/Cookie.class');
const logger = require('../../../common/utils/logger')(__filename);
const organisationApi = require('../../../common/services/organisationApi');

module.exports = (req, res) => {
  const cookie = new CookieModel(req);
  logger.debug('In organisation / delete get controller');
  const errMsg = { message: 'Failed to delete user. Try again' };
  const userId = req.session.deleteUserId;

  if (userId === undefined) {
    res.redirect('/organisation');
    return;
  }
  organisationApi.deleteUser(userId)
    .then((apiResponse) => {
      const parsedResponse = JSON.parse(apiResponse);
      if (Object.prototype.hasOwnProperty.call(parsedResponse, 'message')) {
        req.session.errMsg = errMsg;
        return req.session.save(() => res.redirect('/organisation'));
      }
      req.session.successHeader = 'Success';
      req.session.successMsg = 'User deleted';
      return req.session.save(() => res.redirect('/organisation'));
    })
    .catch((err) => {
      logger.error(err);
      req.session.errMsg = errMsg;
      return req.session.save(() => res.redirect('/organisation'));
    });
};







