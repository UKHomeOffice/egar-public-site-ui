const request = require('../utils/requestWithCorrelationId');
const logger = require('../utils/logger')(__filename);
const endpoints = require('../config/endpoints');

module.exports = {
  /**
   * Sends user tokenId to API.
   *
   * @param {String} tokenId token id
   * @param {String} userId user id for which token was generated
   * @returns {Promise} returns response body when resolved
   */
  setToken(tokenId, userId) {
    return new Promise((resolve, reject) => {
      request.post(
        {
          headers: { 'content-type': 'application/json' },
          url: endpoints.setToken(),
          body: JSON.stringify({
            tokenId,
            userId,
          }),
        },
        (error, _response, body) => {
          if (error) {
            logger.error('Failed to call settoken API', { errorMessage: error?.message, stack: error?.stack });
            reject(error);
          }
          resolve(body);
        }
      );
    });
  },

  /**
   * Sends updated user tokenId to API. This presumes the existence of a token.
   *
   * @param {String} tokenId token id
   * @param {String} userId user id for which token was generated
   * @returns {Promise} returns response body when resolved
   */
  updateToken(tokenId, userId) {
    return new Promise((resolve, reject) => {
      request.put(
        {
          headers: { 'content-type': 'application/json' },
          url: endpoints.setToken(),
          body: JSON.stringify({
            tokenId,
            userId,
          }),
        },
        (error, _response, body) => {
          if (error) {
            logger.error('There was a problem calling the updateToken API');
            reject(error);
            return;
          }
          resolve(body);
        }
      );
    });
  },

  /**
   * Sends organisation invite token to API for storage.
   *
   * @param {String} tokenId token id to be stored
   * @param inviterId
   * @param {String} organisationId organisationid of the organisation sending the invite
   * @param roleName
   * @param inviteeEmail
   * @returns {Promise} returns response body when resolved.
   */
  setInviteUserToken(tokenId, inviterId, organisationId, roleName, inviteeEmail = null) {
    const requestBody = {
      tokenId,
      inviterId,
      organisationId,
      roleName,
    };

    if (inviteeEmail) {
      requestBody.inviteeEmail = inviteeEmail;
    }

    return new Promise((resolve, reject) => {
      request.post(
        {
          headers: { 'content-type': 'application/json' },
          url: endpoints.setToken(),
          body: JSON.stringify(requestBody),
        },
        (error, _response, body) => {
          if (error) {
            logger.error('There was a problem calling the setInviteUserToken API');
            reject(error);
            return;
          }
          resolve(body);
        }
      );
    });
  },
};
