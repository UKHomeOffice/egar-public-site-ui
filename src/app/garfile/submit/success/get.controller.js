import loggerFactory from '../../../../common/utils/logger.js';
const logger = loggerFactory(import.meta.url);
import CookieModel from '../../../../common/models/Cookie.class.js';

export default (req, res) => {
  const cookie = new CookieModel(req);
  logger.debug('In garfile / submit/success get controller');
  res.render('app/garfile/submit/success/index', { cookie });
};
