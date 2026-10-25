const logger = require('../utils/logger')(__filename);
const endpoints = require('../config/endpoints');
const { apiPath, serializeResponse } = require('./legacyApiResponse');

class CreateUserApi {
  constructor(client) {
    this.client = client;
  }

  post(firstName, lastName, email, tokenId = null) {
    const requestBody = { firstName, lastName, email };

    if (tokenId !== null) {
      logger.debug('Creating org user');
      requestBody.tokenId = tokenId;
    }

    return this.client.post(apiPath(endpoints.register()), requestBody);
  }
}

async function post(firstName, lastName, email, tokenId = null) {
  try {
    return serializeResponse(await require('./dataAccessApi').createUserApi.post(firstName, lastName, email, tokenId));
  } catch (error) {
    if (error?.type === 'http_error') {
      return serializeResponse(error.body);
    }

    logger.error('Failed to create user', { errorMessage: error?.message, stack: error?.stack });
  }
}

module.exports = { CreateUserApi, post };
