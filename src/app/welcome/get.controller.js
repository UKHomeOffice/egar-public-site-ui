const logger = require('../../common/utils/logger')(__filename);
const homePageMessage = process.env.HOMEPAGE_MESSAGE;

module.exports = (req, res) => {
  logger.debug('In welcome get controller');
  res.render('app/welcome/index', {homePageMessage});
};
