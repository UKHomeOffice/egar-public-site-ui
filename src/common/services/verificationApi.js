const request = require('request');
const logger = require('../../common/utils/logger')(__filename);
const endpoints = require('../config/endpoints');

module.exports = {

  /**
   * Generate a hash based off of the supplied input.
   * 
   * @param {String} token the token to hash via SHA256
   * @returns {String} a hashed hexidecimal representation of the supplied input
   */
  generateHash(token) {
    logger.debug('Generating hash for token');
    const hash = crypto.createHmac('sha256', config.NOTIFY_TOKEN_SECRET)
      .update(token)
      .digest('hex');
    return hash;
  },

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
      }, (error, response, body) => {
        if(error) {
          if(typeof response !== 'undefined') {
            logger.error(`Code: ${response.statusCode}, message: ${response.statusMessage}`);
          }
          reject('Token verification service failed');
          return ('Token verification service failed');
        }
        resolve(body);
        return body;
      });
    })
    .catch((err) => {
      logger.error(err);
    });
  },
};
