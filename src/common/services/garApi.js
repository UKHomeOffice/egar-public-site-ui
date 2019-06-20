const request = require('request');
const logger = require('../utils/logger')(__filename);
const endpoints = require('../config/endpoints');

module.exports = {
  /**
   * Updates GAR
   * @param {String} garId id of GAR to be patched
   * @param {String} status new status of GAR
   * @param {Object} partial new GAR fields
   * @returns {Promise} resolves with API response
   */
  patch(garId, status, partial) {
    const reqBody = partial;
    reqBody.status = status;
    return new Promise((resolve) => {
      request.patch({
        headers: { 'content-type': 'application/json' },
        url: endpoints.updateGar(garId),
        body: JSON.stringify(reqBody),
      }, (error, response, body) => {
        if (error) {
          logger.error('Failed to call GAR put API endpoint');
          return 'Failed to update GAR';
        }
        resolve(body);
        logger.debug('Successfully called GAR put endpoint');
        return body;
      });
    })
      .catch((err) => {
        logger.error('Failed to call GAR put endpoint');
        logger.error(err);
      });
  },
  /**
   * Gets a GAR's details
   * @param {String} garId id of GAR being requested
   * @returns {Promise} Resolves with API response.
   */
  get(garId) {
    return new Promise((resolve) => {
      request.get({
        headers: { 'content-type': 'application/json' },
        url: endpoints.getGar(garId),
      }, (error, response, body) => {
        if (error) {
          logger.error('Failed to call GAR get API endpoint');
          return console.dir(error);
        }
        resolve(body);
        logger.debug('Successfully called GAR get endpoint');
        return body;
      });
    })
      .catch((err) => {
        logger.error('Failed to call GAR get endpoint');
        logger.error(err);
      });
  },
  /**
   * Gets a GAR's saved people details
   * @param {String} garId id of GAR being requested
   * @returns {Promise} Resolves with API response.
   */
  getPeople(garId) {
    return new Promise((resolve) => {
      request.get({
        headers: { 'content-type': 'application/json' },
        url: endpoints.getGarPeople(garId),
      }, (error, response, body) => {
        if (error) {
          logger.error('Failed to call GAR get people API endpoint');
          return 'Failed to get GAR People';
        }
        resolve(body);
        logger.debug('Successfully called GAR people endpoint');
        return body;
      });
    })
      .catch((err) => {
        logger.error('Failed to call GAR people endpoint');
        logger.error(err);
      });
  },
  /**
   * Gets the GARs belonging to an individual or organisation
   * @param {String} userId id of user making the request
   * @param {String} userType type of user making request in ['Individual', 'Admin', 'Manager', 'User']
   * @param {String} orgId id of organisation a user belongs to. Only required if org user.
   * @returns {Promise} Resolves with API response.
   */
  getGars(userId, userType, orgId = null) {
    const garsUrl = userType === 'Individual' ? endpoints.getIndividualGars(userId) : endpoints.getOrgGars(userId, orgId);
    return new Promise((resolve) => {
      request.get({
        headers: { 'content-type': 'application/json' },
        url: garsUrl,
      }, (error, response, body) => {
        if (error) {
          logger.error('Failed to call get GARs endpoint');
        }
        resolve(body);
        logger.debug('Successfully called get GARs endpoint');
      });
    });
  },

  /**
   * Gets a GAR's supporting people details
   * @param {String} garId id of GAR being requested
   * @returns {Promise} Resolves with API response.
   */
  getSupportingDocs(garId) {
    return new Promise((resolve) => {
      request.get({
        headers: { 'content-type': 'application/json' },
        url: endpoints.getSupportingDoc(garId),
      }, (error, response, body) => {
        if (error) {
          logger.error('Failed to call GAR get supporting documents API endpoint');
          return console.dir(error);
        }
        resolve(body);
        logger.debug('Successfully called supporting documents endpoint');
        return body;
      });
    })
      .catch((err) => {
        logger.error('Failed to call supporting documents endpoint');
        logger.error(err);
      });
  },

  deleteGarSupportingDoc(garId, garSupportingDocId) {
    return new Promise((resolve) => {
      request.delete({
        headers: { 'content-type': 'application/json' },
        url: endpoints.deleteGarSupportingDoc(garId, garSupportingDocId),
      }, (error, response, body) => {
        if (error) {
          logger.error('Failed to call delete gar supporting document endpoint');
          return;
        }
        resolve(body);
        logger.debug('Successfully called delete gar supporting document endpoint');
        return body;
      });
    })
      .catch((err) => {
        logger.error(err.message);
      });
  },
  /**
   * Updates the details of a person on a GAR
   * @param {String} garId the id of the gar the person is associated with
   * @param {String} garPersonId the id of the person
   * @param {String} personDetails the updated details of the person
   * @returns {Promise} resolves with API response.
   */
  updateGarPerson(garId, personDetails) {
    return new Promise((resolve) => {
      request.patch({
        headers: { 'content-type': 'application/json' },
        url: endpoints.updateGarPerson(garId),
        body: JSON.stringify({
          people: [personDetails],
        }),
      }, (error, response, body) => {
        if (error) {
          logger.error('Failed to call update garperson endpoint');
          return;
        }
        resolve(body);
        logger.debug('Successfully called update garperson endpoint');
        return body;
      });
    })
      .catch((err) => {
        logger.error(err.message);
      });
  },
  /**
   * Updates the details of a person on a GAR
   * @param {String} garId the id of the gar the person is associated with
   * @param {String} garPersonId the id of the person
   * @param {String} personDetails the updated details of the person
   * @returns {Promise} resolves with API response.
   */
  deleteGarPerson(garId, garPersonId) {
    return new Promise((resolve) => {
      request.delete({
        headers: { 'content-type': 'application/json' },
        url: endpoints.deleteGarPerson(garId),
        body: JSON.stringify({
          garPeopleId: garPersonId,
        }),
      }, (error, response, body) => {
        if (error) {
          logger.error('Failed to call delete garperson endpoint');
          return;
        }
        resolve(body);
        logger.debug('Successfully called update garperson endpoint');
        return body;
      });
    })
      .catch((err) => {
        logger.error(err.message);
      });
  }
};
