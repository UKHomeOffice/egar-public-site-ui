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
          return error;
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
          return error;
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
   * @param {Number} page page of interested
   * @returns {Promise} resolves with API response
   */
  getPeople(id, userType) { // , page) {
    return new Promise((resolve) => {
      const individualUrl = endpoints.getPeople(id);
      const orgUrl = endpoints.getOrgPeople(id);
      request.get({
        headers: { 'content-type': 'application/json' },
        url: userType.toLowerCase() === 'individual' ? individualUrl : orgUrl,
        // qs: { page, per_page: 5 },
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
          return error;
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
      }, (error, response, body) => {
        if (error) {
          logger.error('Failed to call delete person endpoint');
          return error;
        }
        logger.debug('Successfully called delete person endpoint');
        return resolve(body);
      });
    });
  },
};
