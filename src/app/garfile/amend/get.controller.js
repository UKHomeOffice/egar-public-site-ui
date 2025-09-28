import loggerFactory from '../../../common/utils/logger.js';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const logger = loggerFactory(__filename);
import CookieModel from '../../../common/models/Cookie.class.js';

export default (req, res) => {
  logger.debug('In garfile / amend get controller');
  const cookie = new CookieModel(req);
  res.render('app/garfile/amend/index', { cookie });
};
