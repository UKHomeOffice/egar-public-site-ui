const logger = require('../utils/logger')(__filename);
const endpoints = require('../config/endpoints');
const { apiPath, callConfiguredApi } = require('./legacyApiResponse');

class PersonApi {
  constructor(client) {
    this.client = client;
  }

  create(userId, people) {
    return this.client.post(apiPath(endpoints.createPerson(userId)), people);
  }

  getDetails(userId, personId) {
    return this.client.get(apiPath(endpoints.getPersonData(userId, personId)));
  }

  getPeople(id, userType) {
    const endpoint = userType.toLowerCase() === 'individual' ? endpoints.getPeople(id) : endpoints.getOrgPeople(id);
    return this.client.get(apiPath(endpoint));
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

    return this.client.put(apiPath(endpoints.updatePerson(userId, personId)), {
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
    return this.client.delete(apiPath(endpoints.deletePerson(userId, personId)));
  }
}

async function callConfiguredPersonApi(method, args) {
  const api = require('./dataAccessApi').personApi;
  return callConfiguredApi(api, method, args, logger, 'Person API request failed');
}

module.exports = { PersonApi };

['create', 'getDetails', 'getPeople', 'update', 'deletePerson'].forEach((method) => {
  module.exports[method] = (...args) => callConfiguredPersonApi(method, args);
});
