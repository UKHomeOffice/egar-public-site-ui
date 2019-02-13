const logger = require('../../common/utils/logger');

module.exports = (req, res) => {
  logger.debug('In welcome post controller');
  res.redirect('/login');
};
