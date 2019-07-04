const request = require('request');
const logger = require('../utils/logger')(__filename);
const endpoints = require('../config/endpoints');

module.exports = {
  /**
   * Calls get user details API endpoint.
   * @param {String} email email of user to get details for
   * @returns {Promise} returns JSON parsed response content
   */
  getDetails(email) {
    return new Promise((resolve) => {
      request.get({
        headers: { 'content-type': 'application/json' },
        url: endpoints.getUserData(email),
      },
      (error, response, body) => {
        if (error) {
          return console.dir(error);
        }
        logger.debug('Successfully called get user details API endpoint');
        resolve(body);
        const user = JSON.parse(body);
        return user;
      });
    });
  },

  /**
   * Sends PUT request to API to update user's first and / or last name
   * @param {String} userId id of user to update
   * @param {String} firstName new first name of user
   * @param {String} lastName new last name of user
   * @returns {Promise} returns JSON parsed response when resolved
   */
  updateDetails(userId, firstName, lastName) {
    return new Promise((resolve) => {
      request.put({
        headers: { 'content-type': 'application/json' },
        url: endpoints.updateUserData(userId),
        body: JSON.stringify({
          firstName,
          lastName,
        }),
      },
      (error, response, body) => {
        if (error) {
          logger.error('Failed to call edit user details endpoint');
          return console.dir(error);
        }
        logger.debug('Successfully called edit user details API endpoint');
        resolve(body);
        return JSON.parse(body);
      });
    });
  },
  deleteUser(email) {
    return new Promise((resolve, reject) => {
      request.delete({
        headers: { 'content-type': 'application/json' },
        url: endpoints.deleteUser(email),
      },
      (error, response, body) => {
        if (error) {
          logger.error('Failed to call delete user details endpoint');
          return reject(error);
        }
        logger.debug('Successfully called delete user details API endpoint');
        resolve(body);
        return JSON.parse(body);
      });
    });
  },
  userSearch(email) {
    return new Promise((resolve) => {
      request.get({
        headers: { 'content-type': 'application/json' },
        url: endpoints.userSearch(email),
      }, (error, response, body) => {
        if (error) {
          logger.error('Failed to call user search endpoint');
        }
        resolve(body);
        logger.debug('Successfully called user search endpoint');
        return body;
      });
    })
      .catch((err) => {
        logger.error('Failed to call user search endpoint');
        logger.error(err);
      });
  },
};
