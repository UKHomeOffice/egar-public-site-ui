const request = require('request');
const logger = require('../../common/utils/logger')(__filename);
const endpoints = require('../config/endpoints');

module.exports = {
  /**
  * Confirms user as verified via API
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
        if (error) {
          
          return ("Token Verification Failed")
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
