import loggerFactory from '../../../common/utils/logger.js';
const logger = loggerFactory(import.meta.url);
import CookieModel from '../../../common/models/Cookie.class.js';

export default (req, res) => {
  logger.debug('In garfile / cancel get controller');
  const cookie = new CookieModel(req);
  res.render('app/garfile/cancel/index', { cookie });
};
