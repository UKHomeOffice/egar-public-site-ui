const request = require('request');
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
      logger.info('Sending request to API to verify token');
      request.put({
        headers: { 'content-type': 'application/json' },
        url: endpoints.verifyUser(),
        body: JSON.stringify({
          tokenId,
        }),
      }, (error, _response, body) => {
        if (error) {
          logger.error('Failed to call token verification service');
          reject(new Error('Token verification service failed'));
          return;
        }
        resolve(body);
      });
    }).catch((err) => {
      logger.error(err);
    });
  },

  getUserInviteToken(email) {
    return new Promise((resolve, reject) => {
      const url = new URL(endpoints.verifyUser())
      url.searchParams.append('invitee_email', email)
      logger.info('Sending request to API to verify token');
      request.get({
        url: url.toString(),
        headers: { 'content-type': 'application/json' },
      }, (error, _response, body) => {
        if (error) {
          logger.error('Failed to call token verification service');
          reject(new Error('Token verification service failed'));
          return;
        }
        resolve(JSON.parse(body));
      });
    }).catch((err) => {
      logger.error(err);
    });
  }
};
