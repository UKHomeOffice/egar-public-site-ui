const { AsyncLocalStorage } = require('async_hooks');
const { v4: uuidv4 } = require('uuid');

const correlationContext = new AsyncLocalStorage();

const correlationIdMiddleware = (req, res, next) => {
  const correlationId = uuidv4();
  const sessionId = req.sessionID || null;
  req.correlationId = correlationId;
  res.setHeader('X-Correlation-ID', correlationId);
  correlationContext.run({ correlationId, sessionId }, next);
};

const getCorrelationId = () => correlationContext.getStore()?.correlationId;
const getSessionId = () => correlationContext.getStore()?.sessionId;

module.exports = {
  correlationIdMiddleware,
  getCorrelationId,
  getSessionId,
};
