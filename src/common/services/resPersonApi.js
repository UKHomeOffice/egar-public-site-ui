const logger = require('../utils/logger')(__filename);
const { callConfiguredApi } = require('./legacyApiResponse');

class ResPersonApi {
  constructor(client) {
    this.client = client;
  }

  create(userId, resPerson) {
    return this.client.post(`/user/${userId}/responsiblepersons`, resPerson);
  }

  getResPersons(id) {
    return this.client.get(`/user/${id}/responsiblepersons`);
  }

  getResPersonDetails(userId, responsiblePersonId) {
    return this.client.get(`/user/${userId}/responsibleperson/${responsiblePersonId}`);
  }

  updateResPerson(userId, responsiblePersonId, resPerson) {
    return this.client.put(`/user/${userId}/responsibleperson/${responsiblePersonId}`, resPerson);
  }

  deleteResponsiblePerson(userId, responsiblePersonId) {
    return this.client.delete(`/user/${userId}/responsibleperson/${responsiblePersonId}`);
  }
}

async function callConfiguredResPersonApi(method, args) {
  const api = require('./dataAccessApi').resPersonApi;
  return callConfiguredApi(api, method, args, logger, 'Responsible person API request failed');
}

module.exports = { ResPersonApi };

['create', 'getResPersons', 'getResPersonDetails', 'updateResPerson', 'deleteResponsiblePerson'].forEach((method) => {
  module.exports[method] = (...args) => callConfiguredResPersonApi(method, args);
});
