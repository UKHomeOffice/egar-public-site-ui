import loggerFactory from '../../common/utils/logger.js';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const logger = loggerFactory(__filename);

export default (req, res) => {
  logger.debug('In accessibility get controller');
  res.render('app/accessibility/index');
};
