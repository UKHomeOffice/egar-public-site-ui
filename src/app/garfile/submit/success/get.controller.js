import loggerFactory from '../../../../common/utils/logger.js';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const logger = loggerFactory(__filename);
import CookieModel from '../../../../common/models/Cookie.class.js';

export default (req, res) => {
  const cookie = new CookieModel(req);
  logger.debug('In garfile / submit/success get controller');
  res.render('app/garfile/submit/success/index', { cookie });
};
