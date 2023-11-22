const logger = require('../../common/utils/logger')(__filename);

module.exports = (req, res) => {
  logger.debug('In help get controller');

  res.render('app/help/index');

};
