const logger = require('../utils/logger')(__filename);
const endpoints = require('../config/endpoints');
const { apiPath, callConfiguredApi } = require('./legacyApiResponse');

class TokenApi {
  constructor(client) {
    this.client = client;
  }

  setToken(tokenId, userId) {
    return this.client.post(apiPath(endpoints.setToken()), { tokenId, userId });
  }

  updateToken(tokenId, userId) {
    return this.client.put(apiPath(endpoints.setToken()), { tokenId, userId });
  }

  setInviteUserToken(tokenId, inviterId, organisationId, roleName, inviteeEmail = null) {
    const requestBody = {
      tokenId,
      inviterId,
      organisationId,
      roleName,
    };

    if (inviteeEmail) {
      requestBody.inviteeEmail = inviteeEmail;
    }

    return this.client.post(apiPath(endpoints.setToken()), requestBody);
  }
}

async function callConfiguredTokenApi(method, args) {
  return callConfiguredApi(require('./dataAccessApi').tokenApi, method, args, logger, 'Token API request failed');
}

module.exports = { TokenApi };

['setToken', 'updateToken', 'setInviteUserToken'].forEach((method) => {
  module.exports[method] = (...args) => callConfiguredTokenApi(method, args);
});
