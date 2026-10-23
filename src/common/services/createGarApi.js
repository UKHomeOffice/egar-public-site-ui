const logger = require('../utils/logger')(__filename);

function serializeResponse(response) {
  if (response && typeof response === 'object' && !Array.isArray(response) && 'ok' in response) {
    response = { ...response };
    delete response.ok;
  }
  return typeof response === 'string' ? response : JSON.stringify(response);
}

module.exports = {
  async createGar(userId) {
    try {
      const result = await require('./dataAccessApi').garApi.createGar(userId);
      return serializeResponse(result);
    } catch (err) {
      logger.error('Failed to create GAR', { userId, errorMessage: err?.message, stack: err?.stack });
      if (err?.type === 'http_error') {
        return typeof err.body === 'string' ? err.body : JSON.stringify(err.body);
      }
      return undefined;
    }
  },
};
