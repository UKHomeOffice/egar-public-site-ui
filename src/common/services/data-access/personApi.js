const logger = require('../../utils/logger')(__filename);
const { callConfiguredApi } = require('./legacyApiResponse');

class PersonApi {
  constructor(client) {
    this.client = client;
  }

  create(userId, people) {
    return this.client.post(`/user/${userId}/people`, people);
  }

  getDetails(userId, personId) {
    return this.client.get(`/user/${userId}/people/${personId}`);
  }

  getPeople(id, userType) {
    const endpoint = userType.toLowerCase() === 'individual' ? `/user/${id}/people` : `/organisations/${id}/people`;
    return this.client.get(endpoint);
  }

  update(userId, personId, person) {
    const {
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
      documentDesc,
    } = person;

    return this.client.put(`/user/${userId}/people/${personId}`, {
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
      documentDesc,
    });
  }

  deletePerson(userId, personId) {
    return this.client.delete(`/user/${userId}/people/${personId}`);
  }
}

async function callConfiguredPersonApi(method, args) {
  const api = require('../dataAccessApi').personApi;
  return callConfiguredApi(api, method, args, logger, 'Person API request failed');
}

module.exports = { PersonApi };

['create', 'getDetails', 'getPeople', 'update', 'deletePerson'].forEach((method) => {
  module.exports[method] = (...args) => callConfiguredPersonApi(method, args);
});
