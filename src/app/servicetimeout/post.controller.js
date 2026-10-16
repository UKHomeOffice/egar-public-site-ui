const logger = require('../../common/utils/logger')(__filename);

module.exports = (req, res) => {
  const { serviceTimeoutPageError } = req.body;

  if (serviceTimeoutPageError) {
    logger.error(`An error occurred:${req.body.serviceTimeoutPageError}`);
  }

  res.status(500).render('app/error/500');
};
