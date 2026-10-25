const sinon = require('sinon');
const chai = require('chai');
const { expect } = chai;
chai.use(require('sinon-chai'));

require('../../global.test');
const dataAccessApi = require('../../../common/services/dataAccessApi');
const userManageApi = require('../../../common/services/data-access/userManageApi');
const { HttpClient } = require('../../../common/services/httpClient');

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
    expect(client.get).to.have.been.calledWithExactly('/user/user@example.com');

    await api.userSearch('user@example.com', 'sid-1');
    expect(client.get).to.have.been.calledWithExactly('/user/search', {
      query: { email: 'user@example.com', one_login_sid: 'sid-1' },
    });
  });

  it('omits the One Login filter when no SID is provided', async () => {
    await api.userSearch('user@example.com');

    expect(client.get).to.have.been.calledOnceWithExactly('/user/search', {
      query: { email: 'user@example.com' },
    });
  });

  ['https://api.example.test', 'https://api.example.test/v1', 'https://api.example.test/nested/v1/'].forEach(
    (baseUrl) => {
      it(`resolves user searches against ${baseUrl} with encoded query parameters`, async () => {
        const fetchStub = sinon.stub(global, 'fetch').resolves({ status: 204, ok: true });
        const fetchApi = new userManageApi.UserManageApi(new HttpClient({ baseUrl }));

        await fetchApi.userSearch('user+name@example.com', 'sid & 1');

        expect(fetchStub.firstCall.args[0].href).to.equal(
          `${baseUrl.replace(/\/$/, '')}/user/search?email=user%2Bname%40example.com&one_login_sid=sid+%26+1`
        );
      });
    }
  );

  it('preserves encoded identifiers when resolving paths against the configured base', async () => {
    const fetchStub = sinon.stub(global, 'fetch').resolves({ status: 204, ok: true });
    const fetchApi = new userManageApi.UserManageApi(new HttpClient({ baseUrl: 'https://api.example.test/v1' }));

    await fetchApi.getDetails('user%2Bname%40example.com');

    expect(fetchStub.firstCall.args[0].href).to.equal('https://api.example.test/v1/user/user%2Bname%40example.com');
  });

  it('creates and updates users while preserving optional fields', async () => {
    await api.createUser('user@example.com', 'Ada', 'Lovelace', 'sid-1', 'verified', 'token-1');
    expect(client.post).to.have.been.calledWithExactly('/user/register', {
      email: 'user@example.com',
      firstName: 'Ada',
      lastName: 'Lovelace',
      oneLoginSid: 'sid-1',
      state: 'verified',
      tokenId: 'token-1',
    });

    await api.updateDetails('user-1', 'Ada', 'Lovelace', 'sid-1', 'verified');
    expect(client.put).to.have.been.calledWithExactly('/user/user-1', {
      firstName: 'Ada',
      lastName: 'Lovelace',
      oneLoginSid: 'sid-1',
      state: 'verified',
    });
  });

  it('updates email or One Login SID, and rejects empty updates', async () => {
    await api.updateEmailOrOneLoginSid('user-1', { email: 'new@example.com' });
    expect(client.put).to.have.been.calledWithExactly('/user/user-1', {
      email: 'new@example.com',
    });

    expect(() => api.updateEmailOrOneLoginSid('user-1', {})).to.throw('Provide updateEmail or oneLoginSid');
  });

  it('deletes users with the requester ID', async () => {
    await api.deleteUser('user@example.com', 'requester-1');
    expect(client.delete).to.have.been.calledWithExactly('/user/user@example.com', {
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
