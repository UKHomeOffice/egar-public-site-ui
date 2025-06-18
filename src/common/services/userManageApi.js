const request = require('request');
const logger = require('../utils/logger')(__filename);
const endpoints = require('../config/endpoints');

module.exports = {
  /**
   * Calls get user details API endpoint.
   *
   * @param {String} email email of user to get details for
   * @returns {Promise} returns JSON parsed response content
   */
  getDetails(email) {
    return new Promise((resolve, reject) => {
      request.get({
        headers: { 'content-type': 'application/json' },
        url: endpoints.getUserData(email),
      },
      (error, _response, body) => {
        if (error) {
          logger.error('Failed to call get user details endpoint');
          reject(error);
          return;
        }
        logger.debug('Successfully called get user details API endpoint');
        resolve(JSON.parse(body));
      });
    });
  },

  /**
   * Sends PUT request to API to update user's first and / or last name.
   *
   * @param {String} userId id of user to update
   * @param {String} firstName new first name of user
   * @param {String} lastName new last name of user
   * @param oneLoginSid
   * @param state
   * @returns {Promise} returns JSON parsed response when resolved
   */
  updateDetails(userId, firstName, lastName) {
    const reqBody = {
      firstName,
      lastName,
    }

    return new Promise((resolve, reject) => {
      request.put({
        headers: { 'content-type': 'application/json' },
        url: endpoints.updateUserData(userId),
        body: JSON.stringify(reqBody),
      },
      (error, _response, body) => {
        if (error) {
          logger.error('Failed to call edit user details endpoint');
          reject(error);
          return;
        }
        logger.debug('Successfully called edit user details API endpoint');
        resolve(body);
      });
    });
  },
  /**
   *  Replace the user model in the api with a put operation.
   * @param userId
   * @param userData
   * @returns {Promise<unknown>}
   * TODO: we will need to offer a patch operation on the data-access-api
   */
  updateUserDetails(userId, userData) {
    /**
     *  The previous updateDetails replaces fields not set with null.
     *  since we using a PUT operation, we need the entire object.
     *  TODO: refactor
     */
    return new Promise((resolve, reject) => {
      request.put({
        headers: { 'content-type': 'application/json' },
        url: endpoints.updateUserData(userId),
        body: JSON.stringify(userData),
      },
      (error, _response, body) => {
        if (error) {
          logger.error('Failed to call edit user details endpoint');
          reject(error);
          return;
        }
        logger.debug('Successfully called edit user details API endpoint');
        resolve(body);
      });
    });
  },
  deleteUser(email) {
    return new Promise((resolve, reject) => {
      request.delete({
        headers: { 'content-type': 'application/json' },
        url: endpoints.deleteUser(email),
      },
      (error, _response, body) => {
        if (error) {
          logger.error('Failed to call delete user details endpoint');
          reject(error);
          return;
        }
        logger.debug('Successfully called delete user details API endpoint');
        resolve(body);
      });
    });
  },
  userSearch(email, oneLonginSid = null) {
    return new Promise((resolve, reject) => {
      request.get({
        headers: { 'content-type': 'application/json' },
        url: endpoints.userSearch(email, oneLonginSid),
      }, (error, _response, body) => {
        if (error) {
          logger.error('Failed to call user search endpoint');
          reject(error);
          return;
        }
        logger.debug('Successfully called user search endpoint');
        resolve(JSON.parse(body));
      });
    });
  },

  createUser(email, firstName, lastName, oneLoginSid, state = null, tokenId = null) {
    const reqBody = {
      email,
      firstName,
      lastName,
      oneLoginSid,
    }

    if (state && ['verified', 'unverified'].includes(state)) {
      reqBody['state'] = state;
    }

    if (tokenId) {
      reqBody['tokenId'] = tokenId;
    }

    return new Promise((resolve, reject) => {
      request.post({
        url: endpoints.createUser(),
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(reqBody),
      }, (error, _response, body) => {
        if (error) {
          logger.error('Failed to call create user endpoint');
          logger.error(error);
          reject(error);
          return;
        }
        logger.debug('Successfully called create user endpoint');
        resolve(JSON.parse(body));
      })
    })
  }
};
