const request = require('request');
const logger = require('../../common/utils/logger')(__filename);
const endpoints = require('../config/endpoints');

module.exports = {
  /**
   * Call the create organisation endpoint.
   *
   * @param {String} organisationName Name of organisation to be created
   * @param {String} userId user id of owner of the organisation to be created
   * @returns {Promise} returns response body when resolved.
   */
  create(organisationName, userId) {
    return new Promise((resolve, reject) => {
      request.post({
        headers: { 'content-type': 'application/json' },
        url: endpoints.registerOrg(),
        body: JSON.stringify({
          organisationName,
          userId,
        }),
      }, (error, _response, body) => {
        if (error) {
          logger.error('Failed to call create organisation API');
          reject(error);
          return;
        }
        logger.debug('Successfully called create organisation API');
        resolve(body);
      });
    });
  },

  /**
   * Calls organisation update endpoint and provides new organisation name.
   *
   * @param {String} newOrganisationName new name of organisation
   * @param {String} orgId id of organisation to update
   * @returns {Promise} returns response body when resolved
   */
  update(organisationName, orgId) {
    return new Promise((resolve, reject) => {
      request.put({
        headers: { 'content-type': 'application/json' },
        url: endpoints.updateOrg(orgId),
        body: JSON.stringify({
          organisationName,
        }),
      }, (error, _response, body) => {
        if (error) {
          logger.error('Failed to call update organisation API');
          reject(error);
          return;
        }
        logger.debug('Successfully called update organisation API');
        resolve(body);
      });
    });
  },

  /**
   * Calls get organisation API endpoint and returns organisation details.
   *
   * @param {String} orgId
   * @returns {Promise} returns response body when resolved
   */
  get(orgId) {
    return new Promise((resolve, reject) => {
      request.get({
        headers: { 'content-type': 'application/json' },
        url: endpoints.getOrgDetails(orgId),
      }, (error, _response, body) => {
        if (error) {
          logger.error('Failed to call get organisation details API');
          reject(error);
          return;
        }
        logger.debug('Successfully called get organisation details API');
        resolve(body);
      });
    });
  },
  /**
   * Gets a list of users belonging to an organisation.
   * @param {String} orgId id of an organisation to get users for
   * @returns {Promise} resolves with API response.
   */
  getUsers(orgId) {
    return new Promise((resolve, reject) => {
      request.get({
        headers: { 'content-type': 'application/json' },
        url: endpoints.getOrgUsers(orgId),
      }, (error, _response, body) => {
        if (error) {
          logger.error('Failed to call get organisation users API endpoint');
          reject(error);
          return;
        }
        logger.debug('Successfully called get organisation users API endpoint');
        resolve(body);
      });
    });
  },
  /**
   * Update the details of an organisational user.
   *
   * @param {String} requesterId The id of the user performing the edit
   * @param {Object} userObj The user object containing: ['firstName', 'lastName', 'userId', 'role']
   * @returns {Promise} Resolves with API response
   */
  editUser(requesterId, orgId, userObj) {
    return new Promise((resolve, reject) => {
      request.patch({
        headers: { 'content-type': 'application/json' },
        url: endpoints.editOrgUser(orgId),
        body: JSON.stringify({
          requesterId,
          users: [
            userObj,
          ],
        }),
      }, (error, _response, body) => {
        if (error) {
          logger.error('Failed to call edit organisation users API endpoint');
          reject(error);
          return;
        }
        logger.debug('Successfully called edit organisation users API endpoint');
        resolve(body);
      });
    });
  },
  deleteUser(email) {
    return new Promise((resolve, reject) => {
      request.delete({
        headers: { 'content-type': 'application/json' },
        url: endpoints.deleteUser(email),
      }, (error, _response, body) => {
        if (error) {
          logger.error('Failed to call delete user endpoint');
          reject(error);
          return;
        }
        logger.debug('Successfully called delete user/person endpoint');
        resolve(body);
      });
    });
  },
};
