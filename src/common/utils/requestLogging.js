const logger = require('./logger')(__filename);
const { getCorrelationId } = require('./correlationContext');

const STATIC_ASSET_PREFIXES = ['/assets/', '/images/', '/public/', '/stylesheets/', '/javascripts/', '/.well-known/'];

const STATIC_OR_PROBE_EXTENSION = /\.(map|css|js|png|svg|ico|woff2?|json)$/i;

function getRequestPath(req) {
  return req.path || req.originalUrl || req.url || '';
}

function isStaticOrProbeRequest(req) {
  const requestPath = getRequestPath(req);
  return (
    STATIC_ASSET_PREFIXES.some((prefix) => requestPath.startsWith(prefix)) ||
    STATIC_OR_PROBE_EXTENSION.test(requestPath)
  );
}

module.exports = (req, _res, next) => {
  if (isStaticOrProbeRequest(req)) {
    next();
    return;
  }

  const requestPath = getRequestPath(req);
  const sessionId = req.sessionID || null;
  const correlationId = req.correlationId || getCorrelationId() || null;

  logger.info('HTTP request start', {
    method: req.method,
    url: requestPath,
    httpVersion: req.httpVersion,
    referrer: req.headers?.referer || req.headers?.referrer || '',
    userAgent: req.headers?.['user-agent'] || '',
    sessionId,
    correlationId,
  });

  next();
};
