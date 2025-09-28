import CookieModel from '../../../common/models/Cookie.class.js';
import loggerFactory from '../../../common/utils/logger.js';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const logger = loggerFactory(__filename);
import resPersonApi from '../../../common/services/resPersonApi.js';
import fixedBasedOperatorOptions from '../../../common/seeddata/fixed_based_operator_options.json' with { type: "json"};

export default (req, res) => {
  logger.debug('In responsible person edit get controller');
  const errMsg = { message: 'Failed to get responsible person details' };
  const cookie = new CookieModel(req);
  const responsiblePersonId = req.query.editResponsiblePerson;
  if (responsiblePersonId === undefined) {
    res.redirect('/resperson');
    return;
  }
  req.session.editResponsiblePersonId = responsiblePersonId;
  resPersonApi.getResPersonDetails(cookie.getUserDbId(), responsiblePersonId)
    .then((apiResponse) => {
      const responsiblePerson = JSON.parse(apiResponse);
      return res.render('app/resperson/edit/index', { cookie, responsiblePerson, fixedBasedOperatorOptions });
    })
    .catch((err) => {
      logger.error(err);
      req.session.errMsg = errMsg;
      return req.session.save(() => res.redirect('/resperson'));
    });
};