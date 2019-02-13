const CookieModel = require('../../../../common/models/Cookie.class');
const logger = require('../../../../common/utils/logger');
const craftApi = require('../../../../common/services/craftApi');

module.exports = (req, res) => {
  logger.debug('In organisation / savedcraft / edit get controller');

  const cookie = new CookieModel(req);
  const craftId = req.session.editCraftId;

  if (craftId === undefined) {
    return res.redirect('/organisation/manage');
  }

  craftApi.getDetails(cookie.getUserDbId(), craftId)
    .then((apiResponse) => {
      const editCraft = JSON.parse(apiResponse);
      cookie.setEditCraft(editCraft);
      return res.render('app/organisation/savedcraft/edit/index', { cookie });
    })
    .catch((err) => {
      logger.error(err);
      req.session.errMsg =  { message: 'Failed to get craft details. Try again' };
      return res.render('app/organisation/manage', { cookie });
    });
};
