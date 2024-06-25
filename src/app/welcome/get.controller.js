const logger = require('../../common/utils/logger')(__filename);
const homePageMessageFromEnv = process.env.HOMEPAGE_MESSAGE;
//After decryption of HOMEPAGE_MESSAGE evironment variable, the banner message displays with enclosed double quotes. 
//Remove the duble quotes from start and end of the homePageMessageFromEnv string"
const homePageMessage = homePageMessageFromEnv ? homePageMessageFromEnv.substring(1, homePageMessageFromEnv.length-1) : null;

module.exports = (req, res) => {
  logger.debug('In welcome get controller');
  res.render('app/welcome/index', {homePageMessage});
};
