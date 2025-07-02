const logger = require('../../common/utils/logger')(__filename);
const { HOMEPAGE_MESSAGE } = require('../../common/config/index');

module.exports = (req, res) => {
  logger.debug('In welcome get controller');
  res.render('app/welcome/index', {HOMEPAGE_MESSAGE, cspNonce: res.cspNonce});
};
