const logger = require('../../common/utils/logger')(__filename);

module.exports = (req, res) => {
  logger.debug('In welcome get controller');
  res.render('app/welcome/index');
};
