const request = require('request');
const logger = require('../utils/logger')(__filename);
const endpoints = require('../config/endpoints');

module.exports = {

  /**
   * Creates a new saved person.
   *
   * @param {String} userId userId of user saving the person
   * @param {String} firstName first name of person to be saved
   * @param {String} lastName last name of person to be saved
   * @param {String} documentType type of document in ['Identity Card', 'Passport', 'Other]
   * @param {String} documentNumber document number
   * @param {String} documentExpiryDate date in format 'yyyy-mm-dd'
   * @param {String} personType type of person to be saved in ['Captain', 'Crew', 'Passenger']
   */
  create(userId, firstName, lastName, nationality, placeOfBirth, dateOfBirth, gender, documentType, documentNumber, documentExpiryDate, peopleType, issuingState) {
    return new Promise((resolve) => {
      request.post({
        headers: { 'content-type': 'application/json' },
        url: endpoints.createPerson(userId),
        body: JSON.stringify({
          firstName,
          lastName,
          nationality,
          placeOfBirth,
          dateOfBirth,
          gender,
          documentType,
          documentNumber,
          documentExpiryDate,
          peopleType,
          issuingState,
        }),
      }, (error, response, body) => {
        if (error) {
          logger.error('Failed to call person creation API endpoint');
          return console.dir(error);
        }
        resolve(body);
        logger.debug('Successfully called person creation endpoint');
        return body;
      });
    })
      .catch((err) => {
        logger.error('Failed to call person creation endpoint');
        logger.error(err);
      });
  },

  /**
   * Gets the details of a saved person.
   *
   * @param {String} userId id of user doing the search
   * @param {String} personId id of person to be searched for
   * @returns {Promise} resolves with API response
   */
  getDetails(userId, personId) {
    return new Promise((resolve) => {
      request.get({
        headers: { 'content-type': 'application/json' },
        url: endpoints.getPersonData(userId, personId),
      },
      (error, response, body) => {
        if (error) {
          logger.error('Failed to call get person details endpoint');
          return console.dir(error);
        }
        logger.debug('Successfully called get person details API endpoint');
        resolve(body);
        const user = JSON.parse(body);
        return user;
      });
    });
  },

  /**
   * Get all the saved persons belonging to an individual or organisation.
   *
   * @param {String} id id of entity performing action
   * @param {String} userType type of user performing action in ['individual', 'organisation']
   * @returns {Promise} resolves with API response
   */
  getPeople(id, userType) {
    return new Promise((resolve) => {
      const individualUrl = endpoints.getPeople(id);
      const orgUrl = endpoints.getOrgPeople(id);
      request.get({
        headers: { 'content-type': 'application/json' },
        url: userType.toLowerCase() === 'individual' ? individualUrl : orgUrl,
      },
      (error, response, body) => {
        if (error) {
          logger.error('Failed to call get person details endpoint');
          return console.dir(error);
        }
        logger.debug('Successfully called get person details API endpoint');
        resolve(body);
        const user = JSON.parse(body);
        return user;
      });
    });
  },

  update(userId, personId, firstName, lastName, nationality, placeOfBirth, dateOfBirth, gender, documentType, documentNumber, documentExpiryDate, peopleType, issuingState) {
    return new Promise((resolve) => {
      request.put({
        headers: { 'content-type': 'application/json' },
        url: endpoints.updatePerson(userId, personId),
        body: JSON.stringify({
          firstName,
          lastName,
          nationality,
          placeOfBirth,
          dateOfBirth,
          gender,
          documentType,
          documentNumber,
          documentExpiryDate,
          peopleType,
          issuingState,
        }),
      }, (error, response, body) => {
        if (error) {
          logger.error('Failed to call update person endpoint');
          return console.dir(error);
        }
        resolve(body);
        logger.debug('Successfully called update person endpoint');
        return body;
      });
    })
      .catch((err) => {
        logger.error(err);
      });
  },

  /**
   * Calls the endpoint to delete a saved person.
   *
   * @param {String} userId The id of the user performing the delete
   * @param {String} personId The id of the saved person to be deleted
   * @returns {Promise} resolves with APi response
   */
  deletePerson(userId, personId) {
    return new Promise((resolve) => {
      request.delete({
        headers: { 'content-type': 'application/json' },
        url: endpoints.deletePerson(userId, personId),
      },
      (error, response, body) => {
        if (error) {
          logger.error('Failed to call delete person endpoint');
          return console.dir(error);
        }
        logger.debug('Successfully called delete person endpoint');
        return resolve(body);
      });
    });
  },
};
