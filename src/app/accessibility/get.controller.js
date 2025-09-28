import loggerFactory from '../../common/utils/logger.js';
const logger = loggerFactory(import.meta.url);

export default (req, res) => {
  logger.debug('In accessibility get controller');
  res.render('app/accessibility/index');
};
