const request = require('../utils/requestWithCorrelationId');
const logger = require('../../common/utils/logger')(__filename);
const endpoints = require('../config/endpoints');

module.exports = {
  /**
   * Confirms user as verified via API.
   *
   * @param {String} tokenId tokenId sent to user to be verified
   * @param {String} userId userId of user to be verified
   * @returns {Promise} returns response body when resolved
   */
  verifyUser(tokenId) {
    return new Promise((resolve, reject) => {
      logger.debug('Sending request to verify token');
      request.put(
        {
          headers: { 'content-type': 'application/json' },
          url: endpoints.verifyUser(),
          body: JSON.stringify({
            tokenId,
          }),
        },
        (error, _response, body) => {
          if (error) {
            logger.error('Failed to call token verification API');
            reject(new Error('Token verification API failed'));
            return;
          }
          resolve(body);
        }
      );
    }).catch((err) => {
      logger.warn('Token verification request failed', { errorMessage: err?.message });
    });
  },

  getUserInviteToken(email) {
    return new Promise((resolve, reject) => {
      const url = new URL(endpoints.verifyUser());
      url.search = new URLSearchParams({
        invitee_email: email,
        service: 'sgar',
      });

      logger.debug('Sending request to verify token using email');
      request.get(
        {
          url: url.toString(),
          headers: { 'content-type': 'application/json' },
        },
        (error, _response, body) => {
          if (error) {
            logger.error('Failed to call token verification API');
            reject(new Error('Token verification API failed'));
            return;
          }
          resolve(JSON.parse(body));
        }
      );
    }).catch((err) => {
      logger.warn('Token verification request failed', { errorMessage: err?.message });
    });
  },

  async getUserInviteTokenByTokenId(tokenId) {
    try {
      return await new Promise((resolve, reject) => {
        const url = new URL(endpoints.verifyUser());
        url.searchParams.append('token_id', tokenId);
        logger.debug('Sending request to verify token using token id');
        request.get(
          {
            url: url.toString(),
            headers: { 'content-type': 'application/json' },
          },
          (error, _response, body) => {
            if (error) {
              logger.error('Failed to call token verification API');
              reject(new Error('Token verification API failed'));
              return;
            }
            resolve(JSON.parse(body));
          }
        );
      });
    } catch (err) {
      logger.warn('Token verification request failed', { errorMessage: err?.message });
    }
  },
};
