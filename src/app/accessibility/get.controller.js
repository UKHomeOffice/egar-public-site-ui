const logger = require('../../common/utils/logger')(__filename);

module.exports = (_req, res) => {
  logger.debug('In accessibility get controller');
  res.render('app/accessibility/index');
};
