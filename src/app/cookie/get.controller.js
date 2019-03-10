const logger = require('../../common/utils/logger');

module.exports = (req, res) => {
  logger.debug('In cookies get controller');
  res.render('app/cookie/index');
};
