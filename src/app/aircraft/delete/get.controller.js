const CookieModel = require('../../../common/models/Cookie.class');
const logger = require('../../../common/utils/logger');
const craftApi = require('../../../common/services/craftApi');


module.exports = (req, res) => {
  const cookie = new CookieModel(req);
  logger.debug('In User / saved craft delete get controller');

  const errMsg = { message: 'Failed to delete craft. Try again' };
  const craftId = req.session.deleteCraftId;

  if (craftId === undefined) {
    return res.redirect('/aircraft');
  }

  const craft = cookie.getUserRole() === 'Individual' ? craftApi.deleteCraft(cookie.getUserDbId(), craftId) : craftApi.deleteOrgCraft(cookie.getOrganisationId(), cookie.getUserDbId(), craftId);

  craft.then((apiResponse) => {
      const parsedResponse = JSON.parse(apiResponse);
      if (Object.prototype.hasOwnProperty.call(parsedResponse, 'message')) {
        req.session.errMsg = errMsg;
        res.redirect('/aircraft/#SavedCraft');
      } else {
        req.session.successHeader = 'Success';
        req.session.successMsg = 'Craft deleted';
        res.redirect('/aircraft/#SavedCraft');
      }
    })
    .catch((err) => {
      logger.error(err);
      req.session.errMsg = errMsg;
      res.redirect('/aircraft/#SavedCraft');
    });
};
