const { getCorrelationId } = require('./correlationContext');

const withCorrelationId = (options = {}) => {
  const correlationId = getCorrelationId();

  if (!correlationId) {
    return options;
  }

  return {
    ...options,
    headers: {
      ...(options.headers || {}),
      'X-Correlation-ID': correlationId,
    },
  };
};

const wrapMethod = (requestMethod) => {
  if (!requestMethod) {
    return undefined;
  }

  return (options, callback) => requestMethod(withCorrelationId(options), callback);
};

const createRequestWithCorrelationId = (request) => ({
  get: wrapMethod(request.get && request.get.bind(request)),
  post: wrapMethod(request.post && request.post.bind(request)),
  put: wrapMethod(request.put && request.put.bind(request)),
  patch: wrapMethod(request.patch && request.patch.bind(request)),
  delete: wrapMethod(request.delete && request.delete.bind(request)),
});

const request = createRequestWithCorrelationId(require('request'));

module.exports = request;
module.exports.createRequestWithCorrelationId = createRequestWithCorrelationId;
module.exports.withCorrelationId = withCorrelationId;
