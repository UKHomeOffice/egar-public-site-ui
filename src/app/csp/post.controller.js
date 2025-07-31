const logger = require('../../common/utils/logger')(__filename);

module.exports = (req, res, ) => {
  logger.info('In CSP reports POST controller');
  res.sendStatus(200);
};

