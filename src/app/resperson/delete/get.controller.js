import CookieModel from '../../../common/models/Cookie.class.js';
import loggerFactory from '../../../common/utils/logger.js';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const logger = loggerFactory(__filename);
import resPersonApi from '../../../common/services/resPersonApi.js';

export default (req, res) => {
  const cookie = new CookieModel(req);
  const errMsg = { message: 'Failed to delete responsible person. Try again' };
  const responsiblePersonId = req.query.deleteResponsiblePerson;
  logger.debug('In responsible person / delete get controller');

  if (responsiblePersonId === undefined) {
    res.redirect('/resperson');
    return;
  }

  resPersonApi.deleteResponsiblePerson(cookie.getUserDbId(), responsiblePersonId)
    .then((apiResponse) => {
      const parsedResponse = JSON.parse(apiResponse);
      if (Object.prototype.hasOwnProperty.call(parsedResponse, 'message')) {
        logger.error(`Failed to delete the responsible persons: ${parsedResponse.message}`)
        req.session.errMsg = errMsg;
        return req.session.save(() => res.redirect('/resperson'));
      }
      req.session.successHeader = 'Success';
      req.session.successMsg = 'Responsible is person deleted';
      return req.session.save(() => res.redirect('/resperson'));
    })
    .catch((err) => {
      logger.error(err);
      req.session.errMsg = errMsg;
      return req.session.save(() => res.redirect('/resperson'));
    });
};
