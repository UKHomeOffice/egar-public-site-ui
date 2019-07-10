const CookieModel = require('../../../common/models/Cookie.class');
const logger = require('../../../common/utils/logger')(__filename);
const craftApi = require('../../../common/services/craftApi');
// just for mock , remove once integrated with API
// const savedcraft = require('../../../../common/seeddata/egar_saved_craft.json');

module.exports = (req, res) => {
  logger.debug('In user craft edit get controller');
  const cookie = new CookieModel(req);
  const craftId = req.session.editCraftId;
  if (craftId === undefined) {
    res.redirect('/aircraft');
    return;
  }
  craftApi.getDetails(cookie.getUserDbId(), craftId)
    .then((apiResponse) => {
      const editCraft = JSON.parse(apiResponse);
      cookie.setEditCraft(editCraft);
      return res.render('app/aircraft/edit/index', { cookie });
    })
    .catch((err) => {
      logger.error(err);
      return res.redirect('/aircraft');
    });
};
