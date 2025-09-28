import CookieModel from '../../../common/models/Cookie.class.js';
import loggerFactory from '../../../common/utils/logger.js';
const logger = loggerFactory(import.meta.url);
import craftApi from '../../../common/services/craftApi.js';

export default (req, res) => {
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
