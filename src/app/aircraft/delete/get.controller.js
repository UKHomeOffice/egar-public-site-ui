const CookieModel = require('../../../common/models/Cookie.class');
const logger = require('../../../common/utils/logger')(__filename);
const { craftApi } = require('../../../common/services/dataAccessApi');

module.exports = (req, res) => {
  const cookie = new CookieModel(req);

  const errMsg = { message: 'Failed to delete craft. Try again' };
  const craftId = req.session.deleteCraftId;
  const redirectUrl = '/aircraft';

  if (craftId === undefined) {
    res.redirect(redirectUrl);
    return;
  }

  const craft =
    cookie.getUserRole() === 'Individual'
      ? craftApi.deleteCraft(cookie.getUserDbId(), craftId)
      : craftApi.deleteOrgCraft(cookie.getOrganisationId(), cookie.getUserDbId(), craftId);

  return craft
    .then((apiResponse) => {
      if (Object.prototype.hasOwnProperty.call(apiResponse, 'message')) {
        req.session.errMsg = errMsg;
        return req.session.save(() => {
          res.redirect(redirectUrl);
        });
      }
      req.session.successHeader = 'Success';
      req.session.successMsg = 'Your aircraft has been deleted';
      return req.session.save(() => {
        res.redirect(redirectUrl);
      });
    })
    .catch((err) => {
      logger.error('Failed to delete craft', { craftId, errorMessage: err?.message, stack: err?.stack });
      req.session.errMsg = errMsg;
      return req.session.save(() => {
        res.redirect(redirectUrl);
      });
    });
};
