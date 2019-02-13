const winston = require('winston');

const config = require('../config/index');


const logger = winston.createLogger({
  level: config.LOG_LEVEL.toLowerCase(),
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: '/var/log/nodejs/app.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}

module.exports = logger;
