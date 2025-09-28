import config from '../config/index.js';

const { CORRELATION_HEADER } = config;

export default (req, res, next) => {
  req.correlationId = req.headers[CORRELATION_HEADER] || '';
  next();
};
