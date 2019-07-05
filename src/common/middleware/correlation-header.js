const config = require('../config/index');

const { CORRELATION_HEADER } = config;

module.exports = (req, res, next) => {
  req.correlationId = req.headers[CORRELATION_HEADER] || '';
  next();
};
