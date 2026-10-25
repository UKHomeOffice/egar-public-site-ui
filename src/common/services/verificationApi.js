const logger = require('../utils/logger')(__filename);
const endpoints = require('../config/endpoints');
const { apiPath, serializeResponse } = require('./legacyApiResponse');

class VerificationApi {
  constructor(client) {
    this.client = client;
  }

  verifyUser(tokenId) {
    logger.debug('Sending request to verify token');
    return this.client.put(apiPath(endpoints.verifyUser()), { tokenId });
  }

  getUserInviteToken(email) {
    logger.debug('Sending request to verify token using email');
    return this.client.get(apiPath(endpoints.verifyUser()), {
      query: { invitee_email: email, service: 'sgar' },
    });
  }

  getUserInviteTokenByTokenId(tokenId) {
    logger.debug('Sending request to verify token using token id');
    return this.client.get(apiPath(endpoints.verifyUser()), {
      query: { token_id: tokenId },
    });
  }
}

function unwrapResponse(response) {
  if (response && typeof response === 'object' && !Array.isArray(response) && 'ok' in response) {
    const body = { ...response };
    delete body.ok;
    return body;
  }
  return response;
}

function parseJsonResponse(response) {
  const body = unwrapResponse(response);
  return typeof body === 'string' ? JSON.parse(body) : body;
}

async function callConfiguredVerificationApi(method, args, parseJson = false) {
  try {
    const result = await require('./dataAccessApi').verificationApi[method](...args);
    const body = unwrapResponse(result);
    return parseJson ? parseJsonResponse(body) : serializeResponse(body);
  } catch (error) {
    if (error?.type === 'http_error') {
      return parseJson ? parseJsonResponse(error.body) : serializeResponse(error.body);
    }

    if (method === 'verifyUser') {
      logger.error('Failed to call token verification API');
    }
    logger.warn('Token verification request failed', { errorMessage: error?.message });
  }
}

module.exports = { VerificationApi };

module.exports.verifyUser = (...args) => callConfiguredVerificationApi('verifyUser', args);
module.exports.getUserInviteToken = (...args) => callConfiguredVerificationApi('getUserInviteToken', args, true);
module.exports.getUserInviteTokenByTokenId = (...args) =>
  callConfiguredVerificationApi('getUserInviteTokenByTokenId', args, true);
