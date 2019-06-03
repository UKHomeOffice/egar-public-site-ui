const winston = require('winston');

const config = require('../config/index');

const logger = winston.createLogger({
  level: config.LOG_LEVEL.toLowerCase(),
  format: winston.format.json(),
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}

module.exports = function(fileName) {
  // Dockerfile stores and sets working dir to public-site, so remove it from file path
  const fileNameCleaned = fileName.replace('/public-site/', '');
  var loggerWithFilename = {
    error: function(text) {
      logger.error(fileNameCleaned + ': ' + text);
    },
    debug: function(text) {
      logger.debug(fileNameCleaned + ': ' + text);
    },
    info: function(text) {
      logger.info(fileNameCleaned + ': ' + text);
    }
  };

  return loggerWithFilename;
};
