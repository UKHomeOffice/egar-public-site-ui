const request = require('request');
const logger = require('../utils/logger')(__filename);
const endpoints = require('../config/endpoints');

module.exports = {

  /**
   * Calls create craft API endpoint.
   *
   * @param {String} userId id of user creating the gar
   * @returns {Promise} returns API response when resolved
   */
  createGar(userId) {
    return new Promise((resolve) => {
      request.post({
        headers: { 'content-type': 'application/json' },
        url: endpoints.createGar(userId),
      }, (error, response, body) => {
        if (error) {
          return error;
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
