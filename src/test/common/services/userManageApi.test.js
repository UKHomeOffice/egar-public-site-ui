const sinon = require('sinon');
const chai = require('chai');
const { expect } = chai;
chai.use(require('sinon-chai'));

require('../../global.test');
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
    expect(await api.getDetails('user@example.com')).to.deep.equal({ userId: 'user-1' });
    expect(client.get).to.have.been.calledWithExactly('/user/user@example.com');

    expect(await api.userSearch('user@example.com', 'sid-1')).to.deep.equal({ userId: 'user-1' });
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
    expect(await api.createUser('user@example.com', 'Ada', 'Lovelace', 'sid-1', 'verified', 'token-1')).to.deep.equal({
      userId: 'user-1',
    });
    expect(client.post).to.have.been.calledWithExactly('/user/register', {
      email: 'user@example.com',
      firstName: 'Ada',
      lastName: 'Lovelace',
      oneLoginSid: 'sid-1',
      state: 'verified',
      tokenId: 'token-1',
    });

    expect(await api.updateDetails('user-1', 'Ada', 'Lovelace', 'sid-1', 'verified')).to.deep.equal({ updated: true });
    expect(client.put).to.have.been.calledWithExactly('/user/user-1', {
      firstName: 'Ada',
      lastName: 'Lovelace',
      oneLoginSid: 'sid-1',
      state: 'verified',
    });
  });

  it('updates email or One Login SID, and rejects empty updates', async () => {
    expect(await api.updateEmailOrOneLoginSid('user-1', { email: 'new@example.com' })).to.deep.equal({ updated: true });
    expect(client.put).to.have.been.calledWithExactly('/user/user-1', {
      email: 'new@example.com',
    });

    expect(() => api.updateEmailOrOneLoginSid('user-1', {})).to.throw('Provide updateEmail or oneLoginSid');
  });

  it('deletes users with the requester ID', async () => {
    expect(await api.deleteUser('user@example.com', 'requester-1')).to.deep.equal({ deleted: true });
    expect(client.delete).to.have.been.calledWithExactly('/user/user@example.com', {
      body: { requesterId: 'requester-1' },
    });
  });

  it('exports only the class for construction by dataAccessApi', () => {
    expect(Object.keys(userManageApi)).to.deep.equal(['UserManageApi']);
  });

  [
    ['getDetails', 'get', ['user@example.com']],
    ['userSearch', 'get', ['user@example.com', 'sid-1']],
    ['updateDetails', 'put', ['user-1', 'Ada', 'Lovelace']],
    ['updateEmailOrOneLoginSid', 'put', ['user@example.com', { oneLoginSid: 'sid-1' }]],
    ['createUser', 'post', ['user@example.com', 'Ada', 'Lovelace', 'sid-1']],
    ['deleteUser', 'delete', ['user@example.com', 'requester-1']],
  ].forEach(([method, verb, args]) => {
    it(`propagates client failures unchanged from ${method}`, async () => {
      const error = Object.assign(new Error('Conflict'), {
        type: 'http_error',
        status: 409,
        body: { message: 'Conflict' },
      });
      client[verb].rejects(error);
      try {
        await api[method](...args);
        expect.fail('Expected request to reject');
      } catch (actual) {
        expect(actual).to.equal(error);
      }
    });
  });
});
