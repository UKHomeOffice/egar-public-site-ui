import loggerFactory from '../../../../common/utils/logger.js';
const logger = loggerFactory(import.meta.url);

export default (req, res) => {
  logger.debug('In delete confirm controller');
  res.render('app/user/deleteAccount/deleteAccountConfirmation/index');
};
