const logger = require('../../common/utils/logger');

module.exports = (req, res) => {
  logger.debug('In help get controller');
  res.render('app/help/index');
};
