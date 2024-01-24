const request = require('request');
const logger = require('../utils/logger')(__filename);
const endpoints = require('../config/endpoints');
const autocompleteUtil = require('../utils/autocomplete');
const travelPermissionCodes = require('../utils/travel_permission_codes.json');

function getResponseErrorMessage(_response, body) {
  const responseErrorMessage = JSON.stringify({
    statusCode: _response.statusCode,
    statusMessage: _response.statusMessage,
    body
  });

  return responseErrorMessage;
}

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
    logger.info(JSON.stringify(reqBody))
    return new Promise((resolve, reject) => {
      request.patch({
        headers: { 'content-type': 'application/json' },
        url: endpoints.updateGar(garId),
        body: JSON.stringify(reqBody),
      }, (error, _response, body) => {
        if (error) {
          logger.error('Failed to call GAR put API endpoint');
          reject(error);
          return;
        }

        if (_response.statusCode >= 400) {
          const responseErrorMessage = getResponseErrorMessage(_response, body)
          logger.error(`${garId} garApi.patch request was not successful : ${responseErrorMessage}`);
          resolve(body);
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
      }, (error, _response, body) => {
        if (error) {
          logger.error('Failed to call GAR get API endpoint');
          reject(error);
          return;
        }

        if (_response.statusCode >= 400) {
          const responseErrorMessage = getResponseErrorMessage(_response, body)
          logger.error(`${garId} garApi.get request was not successful : ${responseErrorMessage}`);
          resolve(body);
          return;
        }

        logger.debug('Successfully called GAR get endpoint');
        let gar = JSON.parse(body);
        gar.responsibleCountryLabel = autocompleteUtil.getCountryFromCode(gar.responsibleCounty);

        resolve(JSON.stringify(gar));
      });
    });
  },
  /**
   * Gets a GAR's saved people details.
   *
   * @param {String} garId id of GAR being requested
   * @returns {Promise} Resolves with API response.
   */
  getPeople(garId) {
    return new Promise((resolve, reject) => {
      request.get({
        headers: { 'content-type': 'application/json' },
        url: endpoints.getGarPeople(garId),
      }, (error, _response, body) => {
        if (error) {
          logger.error('Failed to call GAR get people API endpoint');
          reject(error);
          return;
        }

        if (_response.statusCode >= 400) {
          const responseErrorMessage = getResponseErrorMessage(_response, body)
          logger.error(`${garId} garApi.getPeople request was not successful : ${responseErrorMessage}`);
          resolve(body);
          return;
        }

        logger.debug('Successfully called GAR people endpoint');
        const garpeople = JSON.parse(body);

        const noBoardPassengers = garpeople.items
          .filter((garperson) => garperson.amgCheckinResponseCode === travelPermissionCodes["NO_BOARD"]);
        const restOfPassengers = garpeople.items
          .filter((garperson) => garperson.amgCheckinResponseCode !== travelPermissionCodes["NO_BOARD"]);

        resolve(JSON.stringify({
          ...garpeople,
          items: [...noBoardPassengers, ...restOfPassengers]
        }));
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
      }, (error, _response, body) => {
        if (error) {
          logger.error('Failed to call get GARs endpoint');
          reject(error);
          return;
        }

        if (_response.statusCode >= 400) {
          const responseErrorMessage = getResponseErrorMessage(_response, body)
          logger.error(`${userId} garApi.getGars request was not successful : ${responseErrorMessage}`);
          resolve(body);
          return;
        }

        logger.debug('Successfully called get GARs endpoint');
        resolve(body);
      });
    });
  },

  /**
   * Gets a GAR's supporting people details.
   *
   * @param {String} garId id of GAR being requested
   * @returns {Promise} Resolves with API response.
   */
  getSupportingDocs(garId) {
    return new Promise((resolve, reject) => {
      request.get({
        headers: { 'content-type': 'application/json' },
        url: endpoints.getSupportingDoc(garId),
      }, (error, _response, body) => {
        if (error) {
          logger.error('Failed to call GAR get supporting documents API endpoint');
          reject(error);
          return;
        }

        if (_response.statusCode >= 400) {
          const responseErrorMessage = getResponseErrorMessage(_response, body)
          logger.error(`${garId} garApi.getSupportingDocs request was not successful : ${responseErrorMessage}`);
          resolve(body);
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
      }, (error, _response, body) => {
        if (error) {
          logger.error('Failed to call delete gar supporting document endpoint');
          reject(error);
          return;
        }

        if (_response.statusCode >= 400) {
          const responseErrorMessage = getResponseErrorMessage(_response, body)
          logger.error(`${garId} ${garSupportingDocId} garApi.deleteGarSupportingDoc request was not successful : ${responseErrorMessage}`);
          resolve(body);
          return;
        }

        logger.debug('Successfully called delete gar supporting document endpoint');
        resolve(body);
      });
    });
  },

    /**
   * Submits GARPeople for AMG checkin
   *
   * @param {String} garId the id of the gar the person is associated with
   * @returns {Promise} resolves with API response.
   */
    submitGARForCheckin(garId) {
      return new Promise((resolve, reject) => {
        request.post({
          headers: { 'content-type': 'application/json' },
          url: endpoints.submitGARForCheckin(garId),
        }, (error, _response, body) => {
          if (error) {
            logger.error('Failed call passenger checkin endpoint');
            reject(error);
            return;
          }
          
          if (_response.statusCode >= 400) {
            const responseErrorMessage = getResponseErrorMessage(_response, body);
            logger.error(`${garId} garApi.submitGARForCheckin request was not successful : ${responseErrorMessage}`);
            resolve(body);
            return;
          }
          
          logger.debug('Successfully called passenger checkin endpoint');
          resolve(body);
        });
      });
    },

    /**
   * Submits data about whether passengers left with the craft or not.
   *
   * @param {String} garId the id of the gar the person is associated with
   * @param {String[]} exceptions uuids of garpeople that did not depart
   * @returns {Promise} resolves with API response.
   */
    postGarPassengerConfirmations(garId, exceptions, isCancelled = false) {
      return new Promise((resolve, reject) => {
        request.post({
          headers: { 'content-type': 'application/json' },
          url: endpoints.postGarPassengerConfirmations(garId),
          body: JSON.stringify({
            exceptions: exceptions,
            isCancelled
          }),
        }, (error, _response, body) => {
          if (error) {
            logger.error('Failed call passenger confirmation endpoint');
            reject(error);
            return;
          }

          if (_response.statusCode >= 400) {
            const responseErrorMessage = getResponseErrorMessage(_response, body);
            logger.error(`${garId} garApi.postGarPassengerConfirmations request was not successful : ${responseErrorMessage}`);
            resolve(body);
            return;
          }
          
          logger.debug('Successfully called passenger confirmation endpoint');
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
      }, (error, _response, body) => {
        if (error) {
          logger.error('Failed to call update garperson endpoint');
          reject(error);
          return;
        }

        if (_response.statusCode >= 400) {
          const responseErrorMessage = getResponseErrorMessage(_response, body);
          logger.error(`${garId} garApi.updateGarPerson request was not successful : ${responseErrorMessage}`);
          resolve(body);
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
      }, (error, _response, body) => {
        if (error) {
          logger.error('Failed to call delete garperson endpoint');
          reject(error);
          return;
        }

        if (_response.statusCode >= 400) {
          const responseErrorMessage = getResponseErrorMessage(_response, body);
          logger.error(`${garId} ${garPersonId} garApi.deleteGarPerson request was not successful : ${responseErrorMessage}`);
          resolve(body);
          return;
        }

        logger.debug('Successfully called update garperson endpoint');
        resolve(body);
      });
    });
  },
};
