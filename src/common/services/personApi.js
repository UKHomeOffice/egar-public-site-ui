const request = require('request');
const logger = require('../utils/logger')(__filename);
const endpoints = require('../config/endpoints');

module.exports = {

  /**
   * Creates a new saved person. Person object contains:
   * firstName,
   * lastName,
   * nationality,
   * placeOfBirth,
   * dateOfBirth,
   * gender,
   * documentType,
   * documentNumber,
   * documentExpiryDate,
   * peopleType,
   * issuingState,
   *
   * @param {String} userId userId of user saving the person
   * @param {Object} person person Object
   */
  create(userId, person) {
    const { firstName } = person;
    const { lastName } = person;
    const { nationality } = person;
    const { placeOfBirth } = person;
    const { dateOfBirth } = person;
    const { gender } = person;
    const { documentType } = person;
    const { documentNumber } = person;
    const { documentExpiryDate } = person;
    const { peopleType } = person;
    const { issuingState } = person;

    return new Promise((resolve, reject) => {
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
      }, (error, _response, body) => {
        if (error) {
          logger.error('Failed to call person creation API endpoint');
          reject(error);
          return;
        }
        logger.debug('Successfully called person creation endpoint');
        resolve(body);
      });
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
    return new Promise((resolve, reject) => {
      request.get({
        headers: { 'content-type': 'application/json' },
        url: endpoints.getPersonData(userId, personId),
      },
      (error, _response, body) => {
        if (error) {
          logger.error('Failed to call get person details endpoint');
          reject(error);
          return;
        }
        logger.debug('Successfully called get person details API endpoint');
        resolve(body);
      });
    });
  },

  /**
   * Get all the saved persons belonging to an individual or organisation.
   *
   * @param {String} id id of entity performing action
   * @param {String} userType type of user performing action in ['individual', 'organisation']
   * @param {Number} page page of interested
   * @returns {Promise} resolves with API response
   */
  getPeople(id, userType) {
    return new Promise((resolve, reject) => {
      const individualUrl = endpoints.getPeople(id);
      const orgUrl = endpoints.getOrgPeople(id);
      request.get({
        headers: { 'content-type': 'application/json' },
        url: userType.toLowerCase() === 'individual' ? individualUrl : orgUrl,
      },
      (error, _response, body) => {
        if (error) {
          logger.error('Failed to call get person details endpoint');
          reject(error);
          return;
        }
        logger.debug('Successfully called get person details API endpoint');
        resolve(body);
      });
    });
  },

  /**
   * Update a person.
   *
   * @param {String} userId id of the person within the DB
   * @param {String} personId id of the person within the GAR
   * @param {Object} person Object representing the person
   */
  update(userId, personId, person) {
    const { firstName } = person;
    const { lastName } = person;
    const { nationality } = person;
    const { placeOfBirth } = person;
    const { dateOfBirth } = person;
    const { gender } = person;
    const { documentType } = person;
    const { documentNumber } = person;
    const { documentExpiryDate } = person;
    const { peopleType } = person;
    const { issuingState } = person;

    return new Promise((resolve, reject) => {
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
      }, (error, _response, body) => {
        if (error) {
          logger.error('Failed to call update person endpoint');
          reject(error);
          return;
        }
        logger.debug('Successfully called update person endpoint');
        resolve(body);
      });
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
    return new Promise((resolve, reject) => {
      request.delete({
        headers: { 'content-type': 'application/json' },
        url: endpoints.deletePerson(userId, personId),
      }, (error, _response, body) => {
        if (error) {
          logger.error('Failed to call delete person endpoint');
          reject(error);
          return;
        }
        logger.debug('Successfully called delete person endpoint');
        resolve(body);
      });
    });
  },
};
