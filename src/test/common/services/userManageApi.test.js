const sinon = require('sinon');
const chai = require('chai');
const { expect } = chai;
chai.use(require('sinon-chai'));

require('../../global.test');
const endpoints = require('../../../common/config/endpoints');
const dataAccessApi = require('../../../common/services/dataAccessApi');
const userManageApi = require('../../../common/services/userManageApi');

describe('UserManageApi', () => {
  let client;
  let api;

  beforeEach(() => {
    client = {
      get: sinon.stub().resolves({ userId: 'user-1' }),
      put: sinon.stub().resolves({ updated: true }),
      post: sinon.stub().resolves({ userId: 'user-1' }),
      delete: sinon.stub().resolves({ deleted: true }),
    };
    api = new userManageApi.UserManageApi(client);
  });

  afterEach(() => sinon.restore());

  it('looks up and searches users using optional One Login filters', async () => {
    await api.getDetails('user@example.com');
    expect(client.get).to.have.been.calledWithExactly(`${endpoints.baseUrl()}/user/user@example.com`);

    await api.userSearch('user@example.com', 'sid-1');
    expect(client.get).to.have.been.calledWithExactly(
      `${endpoints.baseUrl()}/user/search?email=user%40example.com&one_login_sid=sid-1`
    );
  });

  it('creates and updates users while preserving optional fields', async () => {
    await api.createUser('user@example.com', 'Ada', 'Lovelace', 'sid-1', 'verified', 'token-1');
    expect(client.post).to.have.been.calledWithExactly(`${endpoints.baseUrl()}/user/register`, {
      email: 'user@example.com',
      firstName: 'Ada',
      lastName: 'Lovelace',
      oneLoginSid: 'sid-1',
      state: 'verified',
      tokenId: 'token-1',
    });

    await api.updateDetails('user-1', 'Ada', 'Lovelace', 'sid-1', 'verified');
    expect(client.put).to.have.been.calledWithExactly(`${endpoints.baseUrl()}/user/user-1`, {
      firstName: 'Ada',
      lastName: 'Lovelace',
      oneLoginSid: 'sid-1',
      state: 'verified',
    });
  });

  it('updates email or One Login SID, and rejects empty updates', async () => {
    await api.updateEmailOrOneLoginSid('user-1', { email: 'new@example.com' });
    expect(client.put).to.have.been.calledWithExactly(`${endpoints.baseUrl()}/user/user-1`, {
      email: 'new@example.com',
    });

    expect(() => api.updateEmailOrOneLoginSid('user-1', {})).to.throw('Provide updateEmail or oneLoginSid');
  });

  it('deletes users with the requester ID', async () => {
    await api.deleteUser('user@example.com', 'requester-1');
    expect(client.delete).to.have.been.calledWithExactly(`${endpoints.baseUrl()}/user/user@example.com`, {
      body: { requesterId: 'requester-1' },
    });
  });

  it('preserves object and string response shapes and maps HTTP errors to their response body', async () => {
    sinon.stub(dataAccessApi.userManageApi, 'getDetails').resolves({ ok: true, userId: 'user-1' });
    sinon.stub(dataAccessApi.userManageApi, 'updateDetails').resolves({ ok: true, updated: true });
    expect(await userManageApi.getDetails('user@example.com')).to.deep.equal({ userId: 'user-1' });
    expect(await userManageApi.updateDetails('user-1', 'Ada', 'Lovelace')).to.equal('{"updated":true}');

    const error = Object.assign(new Error('Not found'), {
      type: 'http_error',
      status: 404,
      body: { message: 'User not found' },
    });
    dataAccessApi.userManageApi.getDetails.rejects(error);
    expect(await userManageApi.getDetails('missing@example.com')).to.deep.equal({ message: 'User not found' });
  });

  it('propagates network failures', async () => {
    const error = new Error('offline');
    sinon.stub(dataAccessApi.userManageApi, 'getDetails').rejects(error);

    try {
      await userManageApi.getDetails('user@example.com');
      expect.fail('Expected network failure to reject');
    } catch (actual) {
      expect(actual).to.equal(error);
    }
  });
});
