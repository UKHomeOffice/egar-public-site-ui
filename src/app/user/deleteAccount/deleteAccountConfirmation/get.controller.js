import loggerFactory from '../../../../common/utils/logger.js';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const logger = loggerFactory(__filename);

export default (req, res) => {
  logger.debug('In delete confirm controller');
  res.render('app/user/deleteAccount/deleteAccountConfirmation/index');
};
