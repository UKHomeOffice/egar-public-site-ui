const sinon = require('sinon');
const chai = require('chai');
const { expect } = chai;
chai.use(require('sinon-chai'));

require('../../global.test');
const config = require('../../../common/config/index');
const dataAccessApi = require('../../../common/services/dataAccessApi');
const tokenApi = require('../../../common/services/tokenApi');
const genToken = require('../../../common/services/create-token');

describe('TokenApi', () => {
  let client;
  let api;

  beforeEach(() => {
    client = {
      post: sinon.stub().resolves({ created: true }),
      put: sinon.stub().resolves({ updated: true }),
    };
    api = new tokenApi.TokenApi(client);
  });

  afterEach(() => sinon.restore());

  it('sets and updates user tokens', async () => {
    await api.setToken('token-1', 'user-1');
    expect(client.post).to.have.been.calledWithExactly('/user/settoken', {
      tokenId: 'token-1',
      userId: 'user-1',
    });

    await api.updateToken('token-2', 'user-1');
    expect(client.put).to.have.been.calledWithExactly('/user/settoken', {
      tokenId: 'token-2',
      userId: 'user-1',
    });
  });

  it('preserves optional invitee email in organisation invite tokens', async () => {
    await api.setInviteUserToken('token-1', 'inviter-1', 'org-1', 'Owner', 'invitee@example.com');
    expect(client.post.firstCall.args[0]).to.equal('/user/settoken');
    expect(client.post.firstCall.args[1]).to.deep.equal({
      tokenId: 'token-1',
      inviterId: 'inviter-1',
      organisationId: 'org-1',
      roleName: 'Owner',
      inviteeEmail: 'invitee@example.com',
    });
  });

  it('preserves the token response shape and propagates network failures', async () => {
    sinon.stub(dataAccessApi.tokenApi, 'setToken').resolves({ ok: true, created: true });
    expect(await tokenApi.setToken('token-1', 'user-1')).to.equal('{"created":true}');

    const error = Object.assign(new Error('Conflict'), {
      type: 'http_error',
      status: 409,
      body: { message: 'Token already exists' },
    });
    dataAccessApi.tokenApi.setToken.rejects(error);
    expect(await tokenApi.setToken('token-1', 'user-1')).to.equal('{"message":"Token already exists"}');

    const networkError = new Error('offline');
    dataAccessApi.tokenApi.setToken.rejects(networkError);
    try {
      await tokenApi.setToken('token-1', 'user-1');
      expect.fail('Expected network failure to reject');
    } catch (actual) {
      expect(actual).to.equal(networkError);
    }
  });
});

describe('Generate Hash', () => {
  it('should successfully generate a hash', () => {
    config.NOTIFY_TOKEN_SECRET = 'example';
    const token = 'randominput'.toString();
    const output = genToken.generateHash(token);

    expect(output).not.to.equal(token);
    expect(output.length).to.eq(64);
  });
});
