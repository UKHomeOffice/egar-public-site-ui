import loggerFactory from '../../common/utils/logger.js';
const logger = loggerFactory(import.meta.url);

export default (req, res) => {
  logger.debug('In cookies get controller');
  res.render('app/cookie/index');
};
