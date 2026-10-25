const logger = require('../utils/logger')(__filename);
const { parseJsonResponse, serializeResponse, unwrapResponse } = require('./legacyApiResponse');

class VerificationApi {
  constructor(client) {
    this.client = client;
  }

  verifyUser(tokenId) {
    logger.debug('Sending request to verify token');
    return this.client.put('/user/verify', { tokenId });
  }

  getUserInviteToken(email) {
    logger.debug('Sending request to verify token using email');
    return this.client.get('/user/verify', {
      query: { invitee_email: email, service: 'sgar' },
    });
  }

  getUserInviteTokenByTokenId(tokenId) {
    logger.debug('Sending request to verify token using token id');
    return this.client.get('/user/verify', {
      query: { token_id: tokenId },
    });
  }
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
