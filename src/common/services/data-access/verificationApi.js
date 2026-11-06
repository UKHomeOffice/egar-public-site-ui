const logger = require('../../utils/logger')(__filename);

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

module.exports = { VerificationApi };
