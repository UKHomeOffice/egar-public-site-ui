const logger = require('../utils/logger')(__filename);
const endpoints = require('../config/endpoints');
const { apiPath, callConfiguredApi } = require('./legacyApiResponse');

class ResPersonApi {
  constructor(client) {
    this.client = client;
  }

  create(userId, resPerson) {
    return this.client.post(apiPath(endpoints.createResPerson(userId)), resPerson);
  }

  getResPersons(id) {
    return this.client.get(apiPath(endpoints.getResPersons(id)));
  }

  getResPersonDetails(userId, responsiblePersonId) {
    return this.client.get(apiPath(endpoints.getResPersonDetail(userId, responsiblePersonId)));
  }

  updateResPerson(userId, responsiblePersonId, resPerson) {
    return this.client.put(apiPath(endpoints.getResPersonDetail(userId, responsiblePersonId)), resPerson);
  }

  deleteResponsiblePerson(userId, responsiblePersonId) {
    return this.client.delete(apiPath(endpoints.deleteResPerson(userId, responsiblePersonId)));
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
