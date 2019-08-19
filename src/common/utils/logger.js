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

module.exports = (fileName) => {
  // Dockerfile stores and sets working dir to public-site, so remove it from file path
  const logPrefix = `${fileName.replace('/public-site/', '')}: `;
  const loggerWithFilename = {
    error: text => logger.error(logPrefix + text),
    debug: (text, metadata) => logger.debug(logPrefix + text, metadata),
    info: text => logger.info(logPrefix + text),
  };

  return loggerWithFilename;
};
