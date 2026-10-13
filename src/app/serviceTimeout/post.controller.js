const logger = require('../../common/utils/logger')(__filename);

module.exports = (req, res) => {
  if (req.body.serviceTimeoutPageError) {
    logger.error(`An error occurred:${req.body.serviceTimeoutPageError}`);
    res.render('500.njk');
  }
};
