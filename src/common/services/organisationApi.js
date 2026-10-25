const logger = require('../../common/utils/logger')(__filename);

function serializeResponse(response) {
  if (typeof response === 'string') {
    return response;
  }

  if (response && typeof response === 'object' && !Array.isArray(response) && 'ok' in response) {
    const body = { ...response };
    delete body.ok;
    return JSON.stringify(body);
  }

  return JSON.stringify(response);
}

class OrganisationApi {
  constructor(client) {
    this.client = client;
  }

  create(organisationName, userId) {
    logger.info(`User ${userId} creating organisation`);
    return this.client.post('/organisations', { organisationName, userId });
  }

  update(organisationName, orgId) {
    return this.client.put(`/organisations/${orgId}`, { organisationName });
  }

  get(orgId) {
    return this.client.get(`/organisations/${orgId}`);
  }

  delete(orgId, requesterId) {
    return this.client.delete(`/organisations/${orgId}`, { body: { requesterId } });
  }

  getUsers(orgId, pageNumber, numberOfUsers) {
    return this.client.get(`/organisations/${orgId}/users`, {
      query: { per_page: numberOfUsers, page: pageNumber },
    });
  }

  getListOfOrgUsers(orgId, role = null) {
    return this.client.get(`/organisations/${orgId}/users`, {
      query: role ? { role } : undefined,
    });
  }

  editUser(requesterId, orgId, userObj) {
    return this.client.patch(`/organisations/${orgId}/users`, {
      requesterId,
      users: [userObj],
    });
  }

  deleteUser(requesterId, orgId, userObj) {
    return this.client.delete(`/organisations/${orgId}/users`, {
      body: { requesterId, users: [userObj] },
    });
  }

  getSearchOrgUsers(orgId, searchUserName) {
    return this.client.get(`/organisations/${orgId}/users/search`, {
      query: { searchName: searchUserName },
    });
  }

  getUserById(userId) {
    return this.client.get('/user/search', { query: { user_id: userId } });
  }
}

async function callConfiguredOrganisationApi(method, args) {
  try {
    const result = await require('./dataAccessApi').organisationApi[method](...args);
    return serializeResponse(result);
  } catch (err) {
    logger.error('Organisation API request failed', {
      operation: method,
      status: err?.status,
    });

    if (err?.type !== 'http_error') {
      throw err;
    }

    if (method === 'update') {
      throw err.body;
    }

    return serializeResponse(err.body);
  }
}

const legacyApi = { OrganisationApi };

[
  'create',
  'update',
  'get',
  'delete',
  'getUsers',
  'getListOfOrgUsers',
  'editUser',
  'deleteUser',
  'getSearchOrgUsers',
  'getUserById',
].forEach((method) => {
  legacyApi[method] = (...args) => callConfiguredOrganisationApi(method, args);
});

module.exports = legacyApi;
