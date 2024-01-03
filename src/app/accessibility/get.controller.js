const logger = require('../../common/utils/logger')(__filename);

module.exports = (req, res) => {
  logger.debug('In accessibility get controller');
  res.render('app/accessibility/index');
};
