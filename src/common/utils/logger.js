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
  var loggerWithFilename = {
    error: function(text) {
      logger.error(fileName + ': ' + text);
    },
    debug: function(text) {
      logger.debug(fileName + ': ' + text);
    },
    info: function(text) {
      logger.info(fileName + ': ' + text);
    }
  };

  return loggerWithFilename;
};
