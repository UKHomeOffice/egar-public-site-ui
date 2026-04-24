const logger = require('../../common/utils/logger')(__filename);

module.exports = (_req, res) => {
  logger.debug('In welcome post controller');
  res.redirect('/login');
};
