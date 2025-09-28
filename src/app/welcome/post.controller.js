import loggerFactory from '../../common/utils/logger.js';
const logger = loggerFactory(import.meta.url);

export default (req, res) => {
  logger.debug('In welcome post controller');
  res.redirect('/login');
};
