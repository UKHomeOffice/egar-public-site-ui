import loggerFactory from '../../../../common/utils/logger.js';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const logger = loggerFactory(__filename);
import CookieModel from '../../../../common/models/Cookie.class.js';
import manifestFields from '../../../../common/seeddata/gar_manifest_fields.json' with { type: "json"};
import garApi from '../../../../common/services/garApi.js';

export default (req, res) => {
  const cookie = new CookieModel(req);
  logger.debug('In garfile / review get controller');
  res.render('app/garfile/review/failure/index', { cookie })
};
