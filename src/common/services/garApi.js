const request = require('request');
const logger = require('../utils/logger')(__filename);
const endpoints = require('../config/endpoints');

module.exports = {

  /**
   * Updates GAR.
   *
   * @param {String} garId id of GAR to be patched
   * @param {String} status new status of GAR
   * @param {Object} partial new GAR fields
   * @returns {Promise} resolves with API response
   */

  patch(garId, status, partial) {
    const reqBody = partial;
    reqBody.status = status;
    return new Promise((resolve, reject) => {
      request.patch({
        headers: { 'content-type': 'application/json' },
        url: endpoints.updateGar(garId),
        body: JSON.stringify(reqBody),
      }, (error, response, body) => {
        logger.debug(`Patch GAR details returned status code: ${response && response.statusCode}`);
        if (error) {
          logger.error('Failed to call GAR put API endpoint');
          reject(error);
          return;
        }
        logger.debug('Successfully called GAR put endpoint');
        resolve(body);
      });
    });
  },
  /**
   * Gets a GAR's details.
   *
   * @param {String} garId id of GAR being requested
   * @returns {Promise} Resolves with API response.
   */
  get(garId) {
    return new Promise((resolve, reject) => {
      request.get({
        headers: { 'content-type': 'application/json' },
        url: endpoints.getGar(garId),
      }, (error, response, body) => {
        logger.debug(`Get GAR details returned status code: ${response && response.statusCode}`);
        if (error) {
          logger.error('Failed to call GAR get API endpoint');
          reject(error);
          return;
        }
        logger.debug('Successfully called GAR get endpoint');
        resolve(body);
      });
    });
  },
  /**
   * Gets a GAR's saved people details
   * @param {String} garId id of GAR being requested
   * @returns {Promise} Resolves with API response.
   */
  getPeople(garId) {
    return new Promise((resolve, reject) => {
      request.get({
        headers: { 'content-type': 'application/json' },
        url: endpoints.getGarPeople(garId),
      }, (error, response, body) => {
        logger.debug(`Get GAR people details returned status code: ${response && response.statusCode}`);
        if (error) {
          logger.error('Failed to call GAR get people API endpoint');
          reject(error);
          return;
        }
        logger.debug('Successfully called GAR people endpoint');
        resolve(body);
      });
    });
  },
  /**
   * Gets the GARs belonging to an individual or organisation.
   *
   * @param {String} userId id of user making the request
   * @param {String} userType type of user ['Individual', 'Admin', 'Manager', 'User']
   * @param {String} orgId id of organisation a user belongs to. Only required if org user.
   * @returns {Promise} Resolves with API response.
   */
  getGars(userId, userType, orgId = null) {
    const garsUrl = userType === 'Individual' ? endpoints.getIndividualGars(userId) : endpoints.getOrgGars(userId, orgId);
    return new Promise((resolve, reject) => {
      request.get({
        headers: { 'content-type': 'application/json' },
        url: garsUrl,
      }, (error, response, body) => {
        logger.debug(`Get GARs returned status code: ${response && response.statusCode}`);
        if (error) {
          logger.error('Failed to call get GARs endpoint');
          reject(error);
          return;
        }
        logger.debug('Successfully called get GARs endpoint');
        resolve(body);
      });
    });
  },

  /**
   * Gets a GAR's supporting people details
   * @param {String} garId id of GAR being requested
   * @returns {Promise} Resolves with API response.
   */
  getSupportingDocs(garId) {
    return new Promise((resolve, reject) => {
      request.get({
        headers: { 'content-type': 'application/json' },
        url: endpoints.getSupportingDoc(garId),
      }, (error, response, body) => {
        logger.debug(`Get GAR details returned status code: ${response && response.statusCode}`);
        if (error) {
          logger.error('Failed to call GAR get supporting documents API endpoint');
          reject(error);
          return;
        }
        logger.debug('Successfully called supporting documents endpoint');
        resolve(body);
      });
    });
  },

  deleteGarSupportingDoc(garId, garSupportingDocId) {
    return new Promise((resolve, reject) => {
      request.delete({
        headers: { 'content-type': 'application/json' },
        url: endpoints.deleteGarSupportingDoc(garId, garSupportingDocId),
      }, (error, response, body) => {
        logger.debug(`Delete GAR supporting document returned status code: ${response && response.statusCode}`);
        if (error) {
          logger.error('Failed to call delete gar supporting document endpoint');
          reject(error);
          return;
        }
        logger.debug('Successfully called delete gar supporting document endpoint');
        resolve(body);
      });
    });
  },

  /**
   * Updates the details of a person on a GAR.
   *
   * @param {String} garId the id of the gar the person is associated with
   * @param {String} garPersonId the id of the person
   * @param {String} personDetails the updated details of the person
   * @returns {Promise} resolves with API response.
   */
  updateGarPerson(garId, personDetails) {
    return new Promise((resolve, reject) => {
      request.patch({
        headers: { 'content-type': 'application/json' },
        url: endpoints.updateGarPerson(garId),
        body: JSON.stringify({
          people: [personDetails],
        }),
      }, (error, response, body) => {
        logger.debug(`Patch GAR person returned status code: ${response && response.statusCode}`);
        if (error) {
          logger.error('Failed to call update garperson endpoint');
          reject(error);
          return;
        }
        logger.debug('Successfully called update garperson endpoint');
        resolve(body);
      });
    });
  },

  /**
   * Updates the details of a person on a GAR.
   *
   * @param {String} garId the id of the gar the person is associated with
   * @param {String} garPersonId the id of the person
   * @param {String} personDetails the updated details of the person
   * @returns {Promise} resolves with API response.
   */
  deleteGarPerson(garId, garPersonId) {
    return new Promise((resolve, reject) => {
      request.delete({
        headers: { 'content-type': 'application/json' },
        url: endpoints.deleteGarPerson(garId),
        body: JSON.stringify({
          garPeopleId: garPersonId,
        }),
      }, (error, response, body) => {
        logger.debug(`Delete GAR person returned status code: ${response && response.statusCode}`);
        if (error) {
          logger.error('Failed to call delete garperson endpoint');
          reject(error);
          return;
        }
        logger.debug('Successfully called update garperson endpoint');
        resolve(body);
      });
    });
  },
};
