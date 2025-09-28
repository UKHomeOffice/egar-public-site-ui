import loggerFactory from '../../../common/utils/logger.js';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const logger = loggerFactory(__filename);
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
