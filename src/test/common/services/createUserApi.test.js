const sinon = require('sinon');
const chai = require('chai');
const { expect } = chai;
chai.use(require('sinon-chai'));

require('../../global.test');
const endpoints = require('../../../common/config/endpoints');
const dataAccessApi = require('../../../common/services/dataAccessApi');
const registerApi = require('../../../common/services/createUserApi');

describe('CreateUserApi', () => {
  let client;
  let api;

  beforeEach(() => {
    client = { post: sinon.stub().resolves({ userId: 'user-1' }) };
    api = new registerApi.CreateUserApi(client);
  });

  afterEach(() => sinon.restore());

  it('creates users with optional invite tokens through the injected client', async () => {
    await api.post('Ada', 'Lovelace', 'ada@example.com', 'invite-token');
    expect(client.post).to.have.been.calledWithExactly(`${endpoints.baseUrl()}/user/register`, {
      firstName: 'Ada',
      lastName: 'Lovelace',
      email: 'ada@example.com',
      tokenId: 'invite-token',
    });

    await api.post('Ada', 'Lovelace', 'ada@example.com');
    expect(client.post.secondCall.args[1]).to.deep.equal({
      firstName: 'Ada',
      lastName: 'Lovelace',
      email: 'ada@example.com',
    });
  });

  it('preserves the serialized success shape and returns HTTP error bodies', async () => {
    sinon.stub(dataAccessApi.createUserApi, 'post').resolves({ ok: true, tokenId: 'token-1' });
    expect(await registerApi.post('Ada', 'Lovelace', 'ada@example.com')).to.equal('{"tokenId":"token-1"}');

    const error = Object.assign(new Error('Already registered'), {
      type: 'http_error',
      status: 400,
      body: { message: 'User already registered' },
    });
    dataAccessApi.createUserApi.post.rejects(error);
    expect(await registerApi.post('Ada', 'Lovelace', 'ada@example.com')).to.equal(
      '{"message":"User already registered"}'
    );
  });

  it('preserves the existing swallowed network failure behavior', async () => {
    sinon.stub(dataAccessApi.createUserApi, 'post').rejects(new Error('offline'));
    expect(await registerApi.post('Ada', 'Lovelace', 'ada@example.com')).to.be.undefined;
  });
});
