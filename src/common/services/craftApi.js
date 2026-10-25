const logger = require('../utils/logger')(__filename);
const endpoints = require('../config/endpoints');
const { apiPath, callConfiguredApi } = require('./legacyApiResponse');

class CraftApi {
  constructor(client) {
    this.client = client;
  }

  create(registration, craftType, craftBase, userId) {
    return this.client.post(apiPath(endpoints.createCraft(userId)), {
      registration,
      craftType,
      craftBase,
    });
  }

  getDetails(userId, craftId) {
    return this.client.get(apiPath(endpoints.getCraftData(userId, craftId)));
  }

  getCrafts(userId, pageNumber) {
    return this.client.get(apiPath(endpoints.getCrafts(userId)), {
      query: { per_page: 5, page: pageNumber },
    });
  }

  getOrgCrafts(orgId, pageNumber) {
    return this.client.get(apiPath(endpoints.getOrgCrafts(orgId)), {
      query: { per_page: 5, page: pageNumber },
    });
  }

  update(registration, craftType, craftBase, userId, craftId) {
    return this.client.put(apiPath(endpoints.updateCraft(userId, craftId)), {
      registration,
      craftType,
      craftBase,
    });
  }

  deleteCraft(requesterId, craftId) {
    return this.client.delete(apiPath(endpoints.deleteCraft(requesterId, craftId)), {
      body: { requesterId, crafts: [{ craftId }] },
    });
  }

  deleteOrgCraft(orgId, requesterId, craftId) {
    return this.client.delete(apiPath(endpoints.getOrgCrafts(orgId)), {
      body: { requesterId, crafts: [{ craftId }] },
    });
  }
}

async function callConfiguredCraftApi(method, args) {
  const api = require('./dataAccessApi').craftApi;
  return callConfiguredApi(api, method, args, logger, 'Craft API request failed');
}

module.exports = { CraftApi };

['create', 'getDetails', 'getCrafts', 'getOrgCrafts', 'update', 'deleteCraft', 'deleteOrgCraft'].forEach((method) => {
  module.exports[method] = (...args) => callConfiguredCraftApi(method, args);
});
