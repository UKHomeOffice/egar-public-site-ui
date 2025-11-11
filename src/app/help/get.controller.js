const logger = require('../../common/utils/logger')(__filename);

module.exports = (_req, res) => {
  logger.debug('In help get controller');

  res.render('app/help/index');
};
