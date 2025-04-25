const logger = require('../../../../common/utils/logger')(__filename);

module.exports = (req, res) => {
  logger.debug('In delete confirm controller');
  res.render('app/user/deleteAccount/deleteAccountConfirmation/index');
};
