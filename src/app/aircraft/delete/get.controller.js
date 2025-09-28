import CookieModel from '../../../common/models/Cookie.class.js';
import loggerFactory from '../../../common/utils/logger.js';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const logger = loggerFactory(__filename);
import craftApi from '../../../common/services/craftApi.js';


export default (req, res) => {
  const cookie = new CookieModel(req);
  logger.debug('In User / saved craft delete get controller');

  const errMsg = { message: 'Failed to delete craft. Try again' };
  const craftId = req.session.deleteCraftId;
  const redirectUrl = '/aircraft';

  if (craftId === undefined) {
    res.redirect(redirectUrl);
    return;
  }

  const craft = cookie.getUserRole() === 'Individual' ? craftApi.deleteCraft(cookie.getUserDbId(), craftId) : craftApi.deleteOrgCraft(cookie.getOrganisationId(), cookie.getUserDbId(), craftId);

  craft.then((apiResponse) => {
    const parsedResponse = JSON.parse(apiResponse);
    if (Object.prototype.hasOwnProperty.call(parsedResponse, 'message')) {
      req.session.errMsg = errMsg;
      return req.session.save(() => { res.redirect(redirectUrl); });
    }
    req.session.successHeader = 'Success';
    req.session.successMsg = 'Your aircraft has been deleted';
    return req.session.save(() => { res.redirect(redirectUrl); });
  }).catch((err) => {
    logger.error(err);
    req.session.errMsg = errMsg;
    return req.session.save(() => { res.redirect(redirectUrl); });
  });
};
