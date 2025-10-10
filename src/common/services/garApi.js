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

        logger.debug('Successfully called GAR patch endpoint');
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
  get(garId, isCbpId = false) {
    return new Promise((resolve, reject) => {
      request.get({
        headers: { 'content-type': 'application/json' },
        url: endpoints.getGar(garId, isCbpId),
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

        let gar = JSON.parse(body);
        gar.responsibleCountryLabel = autocompleteUtil.getCountryFromCode(gar.responsibleCountry);

        logger.debug('Successfully called GAR get endpoint');
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
  getPeople(garId, pageNumber=null, amgResponseCode=null) {
    const priority = [
        'amg_checkin_response_code:0T',
        'amg_checkin_response_code:0B',
        'amg_checkin_response_code:0Z',
        'amg_checkin_response_code:0A',
      ];
    const pageObj = pageNumber ? {per_page: 10,
         page: pageNumber} : '';  
    
    const options = amgResponseCode ? {amg_response_codes: amgResponseCode} : [''];     
    return new Promise((resolve, reject) => {
      request.get({
        headers: { 'content-type': 'application/json' },
        url: endpoints.getGarPeople(garId, { priority }),
        qs: { ...pageObj, ...options }
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

        const garpeople = JSON.parse(body);

        const noBoardPassengers = garpeople.items
          .filter((garperson) => garperson.amgCheckinResponseCode === travelPermissionCodes["NO_BOARD"]);
        const restOfPassengers = garpeople.items
          .filter((garperson) => garperson.amgCheckinResponseCode !== travelPermissionCodes["NO_BOARD"]);

        logger.debug('Successfully called GAR people endpoint');
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
  getGars(userId, userType, page, orgId = null) {
    const garsUrl = userType === 'Individual' ? endpoints.getIndividualGars(userId, 1) : endpoints.getOrgGars(userId, orgId, page);
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
    submitGARForException(garId, passengerIds = []) {
      const onlyIndividuals = passengerIds.length > 0;
      return new Promise((resolve, reject) => {
        request.post({
          headers: { 'content-type': 'application/json' },
          url: endpoints.submitGARForException(garId, onlyIndividuals),
          body: JSON.stringify({ passengerIds }),
        }, (error, _response, body) => {
          if (error) {
            logger.error('Failed call passenger exception endpoint');
            reject(error);
            return;
          }

          if (_response.statusCode >= 400) {
            const responseErrorMessage = getResponseErrorMessage(_response, body);
            logger.error(`${garId} garApi.submitGARForException request was not successful : ${responseErrorMessage}`);
            resolve(body);
            return;
          }
          
          logger.debug('Successfully called passenger exception endpoint');
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
  deleteGarPeople(garId, garPersonId) {
    return new Promise((resolve, reject) => {
      request.delete({
        headers: { 'content-type': 'application/json' },
        url: endpoints.deleteGarPeople(garId),
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
          logger.error(`${garId} ${garPersonId} garApi.deleteGarPeople request was not successful : ${responseErrorMessage}`);
          resolve(body);
          return;
        }

        logger.debug('Successfully called update garperson endpoint');
        resolve(body);
      });
    });
  },

  getGarCheckinProgress(garId) {
    return new Promise((resolve, reject) => {
      request.get({
        headers: { 'content-type': 'application/json' },
        url: endpoints.getGarCheckinProgress(garId),
      }, (error, _response, body) => {
        if (error) {
          logger.error('Failed to call GAR progress API endpoint');
          reject(error);
          return;
        }

        if (_response.statusCode >= 400) {
          const responseErrorMessage = getResponseErrorMessage(_response, body)
          logger.error(`${garId} garApi.progress request was not successful : ${responseErrorMessage}`);
          resolve(body);
          return;
        }
        
        logger.debug('Successfully called progress endpoint');
        resolve(body);
      });
    });

  },

  getDurationBeforeDeparture(departureDate, departureTime) {
    const departureDateTimeString = `${departureDate} ${departureTime}`;
    const departureDateTime = new Date(departureDateTimeString);
    const currentDateTimeISO = new Date().toISOString();
    const currentDateTime = new Date(currentDateTimeISO);
    return Math.round((departureDateTime-currentDateTime)/1000/60);
  }
 
};
