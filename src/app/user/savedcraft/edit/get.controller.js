const CookieModel = require('../../../../common/models/Cookie.class');
const logger = require('../../../../common/utils/logger');
const craftApi = require('../../../../common/services/craftApi');
// just for mock , remove once integrated with API
// const savedcraft = require('../../../../common/seeddata/egar_saved_craft.json');

module.exports = (req, res) => {
  logger.debug('In user / savedcraft / edit get controller');
  const cookie = new CookieModel(req);
  const craftId = req.session.editCraftId;
  if (craftId === undefined) {
    return res.redirect('/user/details');
  }
  craftApi.getDetails(cookie.getUserDbId(), craftId)
    .then((apiResponse) => {
      const editCraft = JSON.parse(apiResponse);
      cookie.setEditCraft(editCraft);
      return res.render('app/user/savedcraft/edit/index', { cookie });
    })
    .catch((err) => {
      logger.error(err);
      return res.redirect('/user/details');
    });
};
