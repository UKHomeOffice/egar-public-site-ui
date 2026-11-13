const pino = require('pino');
const config = require('../config/index');
const { getCorrelationId, getSessionId } = require('./correlationContext');

const LEVEL_NAME_MAP = { warn: 'WARNING' };

const EMAIL_REGEX = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;

const maskEmail = (email) => {
  const [prefix, domain] = email.split('@');
  if (prefix.length <= 2) {
    return `${prefix[0]}***@${domain}`;
  }
  return `${prefix[0]}***${prefix.slice(-1)}@${domain}`;
};

const logger = pino({
  level: config.LOG_LEVEL.toLowerCase(),
  base: null,
  messageKey: 'message',
  timestamp: () => `,"timestamp":"${new Date().toISOString()}"`,
  formatters: {
    level(label) {
      return {
        level: LEVEL_NAME_MAP[label] || label.toUpperCase(),
      };
    },
  },
});

const getCallerLineNumber = () => {
  const stack = new Error().stack?.split('\n') ?? [];
  const callerFrame = stack.find(
    (line) => (line.includes('.js:') || line.includes('.ts:')) && !line.includes('common/utils/logger')
  );

  if (!callerFrame) {
    return undefined;
  }

  const match = callerFrame.match(/:(\d+):\d+\)?$/);
  return match ? Number(match[1]) : undefined;
};

const formatValue = (value) => {
  if (value instanceof Error) {
    return value.stack || value.message;
  }

  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'object' && value !== null) {
    return JSON.stringify(value);
  }

  return String(value);
};

const maskMessage = (text) => formatValue(text).replace(EMAIL_REGEX, (email) => maskEmail(email));

const buildMetadata = (fileName, metadata) => {
  const correlationId = getCorrelationId();
  const sessionId = getSessionId();
  const logMetadata = {
    fileName,
  };

  if (correlationId) {
    logMetadata.correlationId = correlationId;
  }

  logMetadata.sessionId = sessionId || null;

  const lineNumber = getCallerLineNumber();
  if (lineNumber !== undefined) {
    logMetadata.lineNumber = lineNumber;
  }

  if (metadata === undefined) {
    return logMetadata;
  }

  if (metadata instanceof Error) {
    return {
      ...logMetadata,
      errorMessage: metadata.message,
      stack: metadata.stack,
    };
  }

  if (typeof metadata === 'object' && metadata !== null) {
    return {
      ...logMetadata,
      ...metadata,
    };
  }

  return {
    ...logMetadata,
    metadata: formatValue(metadata),
  };
};

module.exports = (fileName) => {
  // Dockerfile stores and sets working dir to public-site, so remove it from file path
  const normalisedFileName = fileName.replace('/public-site/', '/');
  return {
    error: (text, metadata) => logger.error(buildMetadata(normalisedFileName, metadata), maskMessage(text)),
    warn: (text, metadata) => logger.warn(buildMetadata(normalisedFileName, metadata), maskMessage(text)),
    debug: (text, metadata) => logger.debug(buildMetadata(normalisedFileName, metadata), maskMessage(text)),
    info: (text, metadata) => logger.info(buildMetadata(normalisedFileName, metadata), maskMessage(text)),
  };
};
