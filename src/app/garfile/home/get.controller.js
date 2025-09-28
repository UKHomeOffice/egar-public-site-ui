import loggerFactory from '../../../common/utils/logger.js';
const logger = loggerFactory(import.meta.url);
import CookieModel from '../../../common/models/Cookie.class.js';
import garoptions from '../../../common/seeddata/egar_create_gar_options.json' with { type: 'json' };

export default (req, res) => {
  logger.debug('In garfile / home get controller');
  const cookie = new CookieModel(req);
  res.render('app/garfile/home/index', {
    cookie,
    garoptions,
  });
};
