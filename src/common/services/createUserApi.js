const request = require('request');
const logger = require('../utils/logger');
const endpoints = require('../config/endpoints');

module.exports = {
  /**
   * Posts userdata to user creation API endpoint.
   * @param {String} fname First name of user
   * @param {String} lname Last name of user
   * @param {String} userEmail Email of user
   * @param {String=null} tokenId tokenId sent to invited user
   * @return {Promise}
   */
  post(firstName, lastName, email, tokenId = null) {
    const reqBody = { firstName, lastName, email };
    // The tokenId sent to an invited user by an org is required
    // by the API
    // add to req body if provided.
    if (tokenId !== null) {
      logger.debug('Creating org user');
      reqBody.tokenId = tokenId;
    }
    return new Promise((resolve, reject) => {
      request.post({
        headers: { 'content-type': 'application/json' },
        url: endpoints.register(),
        body: JSON.stringify(reqBody),
      }, (error, response, body) => {
        if (error) {
          reject(error);
        }
        resolve(body);
      });
    })
      .catch((err) => {
        logger.error(err);
      });
  },
};
