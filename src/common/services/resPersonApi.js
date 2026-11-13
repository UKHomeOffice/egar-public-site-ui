const request = require('../utils/requestWithCorrelationId');
const logger = require('../utils/logger')(__filename);
const endpoints = require('../config/endpoints');

module.exports = {
  create(userId, resPerson) {
    return new Promise((resolve, reject) => {
      request.post(
        {
          headers: { 'content-type': 'application/json' },
          url: endpoints.createResPerson(userId),
          body: JSON.stringify(resPerson),
        },
        (error, _response, body) => {
          if (error) {
            logger.error('Failed to call responsible person creation API endpoint');
            reject(error);
            return;
          }
          resolve(body);
        }
      );
    });
  },

  getResPersons(id) {
    return new Promise((resolve, reject) => {
      const url = endpoints.getResPersons(id);
      request.get(
        {
          headers: { 'content-type': 'application/json' },
          url: url,
        },
        (error, _response, body) => {
          if (error) {
            logger.error('Failed to call get responsible person details endpoint');
            reject(error);
            return;
          }
          resolve(body);
        }
      );
    });
  },

  getResPersonDetails(userId, responsiblePersonId) {
    return new Promise((resolve, reject) => {
      request.get(
        {
          headers: { 'content-type': 'application/json' },
          url: endpoints.getResPersonDetail(userId, responsiblePersonId),
        },
        (error, _response, body) => {
          if (error) {
            logger.error('Failed to call get responsible person details endpoint');
            reject(error);
            return;
          }
          resolve(body);
        }
      );
    });
  },

  updateResPerson(userId, responsiblePersonId, resPerson) {
    return new Promise((resolve, reject) => {
      request.put(
        {
          headers: { 'content-type': 'application/json' },
          url: endpoints.getResPersonDetail(userId, responsiblePersonId),
          body: JSON.stringify(resPerson),
        },
        (error, _response, body) => {
          if (error) {
            logger.error('Failed to call update person details endpoint', {
              errorMessage: error?.message,
              stack: error?.stack,
            });
            reject(error);
            return;
          }
          resolve(body);
        }
      );
    });
  },

  deleteResponsiblePerson(userId, responsiblePersonId) {
    return new Promise((resolve, reject) => {
      request.delete(
        {
          headers: { 'content-type': 'application/json' },
          url: endpoints.deleteResPerson(userId, responsiblePersonId),
        },
        (error, _response, body) => {
          if (error) {
            logger.error('Failed to call delete responsible person endpoint');
            reject(error);
            return;
          }
          resolve(body);
        }
      );
    });
  },
};
