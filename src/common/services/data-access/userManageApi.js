const logger = require('../../utils/logger')(__filename);
const { parseJsonResponse, serializeResponse, unwrapResponse } = require('./legacyApiResponse');

class UserManageApi {
  constructor(client) {
    this.client = client;
  }

  getDetails(email) {
    return this.client.get(`/user/${email}`);
  }

  updateDetails(userId, firstName, lastName, oneLoginSid = null, state = null) {
    const requestBody = { firstName, lastName };

    if (oneLoginSid) {
      requestBody.oneLoginSid = oneLoginSid;
    }

    if (state) {
      requestBody.state = state;
    }

    return this.client.put(`/user/${userId}`, requestBody);
  }

  updateEmailOrOneLoginSid(userEmail, { email, oneLoginSid }) {
    const requestBody = {};

    if (email) {
      requestBody.email = email;
    }

    if (oneLoginSid) {
      requestBody.oneLoginSid = oneLoginSid;
    }

    if (Object.keys(requestBody).length === 0) {
      throw new Error('Provide updateEmail or oneLoginSid');
    }

    return this.client.put(`/user/${userEmail}`, requestBody);
  }

  deleteUser(email, requesterId) {
    return this.client.delete(`/user/${email}`, { body: { requesterId } });
  }

  userSearch(email, oneLoginSid = null) {
    const query = { email };
    if (oneLoginSid) {
      query.one_login_sid = oneLoginSid;
    }
    return this.client.get('/user/search', { query });
  }

  createUser(email, firstName, lastName, oneLoginSid, state = null, tokenId = null) {
    const requestBody = {
      email,
      firstName,
      lastName,
      oneLoginSid,
    };

    if (state && ['verified', 'unverified'].includes(state)) {
      requestBody.state = state;
    }

    if (tokenId) {
      requestBody.tokenId = tokenId;
    }

    return this.client.post('/user/register', requestBody);
  }
}

async function callConfiguredUserApi(method, args, parseJson = false) {
  try {
    const result = await require('../dataAccessApi').userManageApi[method](...args);
    return parseJson ? parseJsonResponse(result) : serializeResponse(unwrapResponse(result));
  } catch (error) {
    if (error?.type === 'http_error') {
      return parseJson ? parseJsonResponse(error.body) : serializeResponse(error.body);
    }

    logger.error('User API request failed', {
      operation: method,
      errorMessage: error?.message,
      status: error?.status,
    });
    throw error;
  }
}

module.exports = { UserManageApi };

['getDetails', 'userSearch', 'createUser'].forEach((method) => {
  module.exports[method] = (...args) => callConfiguredUserApi(method, args, true);
});

['updateDetails', 'updateEmailOrOneLoginSid', 'deleteUser'].forEach((method) => {
  module.exports[method] = (...args) => callConfiguredUserApi(method, args);
});
