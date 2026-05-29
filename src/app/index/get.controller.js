const logger = require('../../common/utils/logger')(__filename);

module.exports = (_req, res) => {
  logger.debug('In index get controller');
  res.redirect('/welcome/index');
};
