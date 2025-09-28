import loggerFactory from '../../../common/utils/logger.js';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const logger = loggerFactory(__filename);
import CookieModel from '../../../common/models/Cookie.class.js';
import garApi from '../../../common/services/garApi.js';

export default (req, res) => {
  const cookie = new CookieModel(req);
  logger.debug(`In garfile / amend post controller - User: ${cookie.getUserDbId()} editing GAR: ${cookie.getGarId()}`);

  garApi.patch(cookie.getGarId(), 'Draft', {})
    .then(() => {

      req.session.successMsg = 'You may now amend the GAR and resubmit it.';
      req.session.successHeader = 'GAR Amendment';
      req.session.save(() => {
        res.redirect('/garfile/view');
      });
    })
};