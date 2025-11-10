const config = require('../config/index');

const { CORRELATION_HEADER } = config;

module.exports = (req, _res, next) => {
  req.correlationId = req.headers[CORRELATION_HEADER] || '';
  next();
};
