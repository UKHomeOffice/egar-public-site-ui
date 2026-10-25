const sinon = require('sinon');
const { expect } = require('chai');

require('./global.test');
const dataAccessApi = require('../common/services/dataAccessApi');
const verificationApi = require('../common/services/data-access/verificationApi');

describe('VerificationApi', () => {
  let client;
  let api;

  beforeEach(() => {
    client = {
      put: sinon.stub().resolves({ verified: true }),
      get: sinon.stub().resolves({ tokenId: 'token-1' }),
    };
    api = new verificationApi.VerificationApi(client);
  });

  afterEach(() => sinon.restore());

  it('verifies a user with the token ID', async () => {
    await api.verifyUser('token-1');
    expect(client.put).to.have.been.calledWithExactly('/user/verify', { tokenId: 'token-1' });
  });

  it('looks up invite tokens with the expected email, service, and token filters', async () => {
    await api.getUserInviteToken('invitee@example.com');
    expect(client.get).to.have.been.calledWithExactly('/user/verify', {
      query: { invitee_email: 'invitee@example.com', service: 'sgar' },
    });

    await api.getUserInviteTokenByTokenId('token-1');
    expect(client.get.secondCall.args).to.deep.equal(['/user/verify', { query: { token_id: 'token-1' } }]);
  });

  it('returns successful verification and invite responses in their established shapes', async () => {
    sinon.stub(dataAccessApi.verificationApi, 'verifyUser').resolves({ ok: true, verified: true });
    sinon.stub(dataAccessApi.verificationApi, 'getUserInviteToken').resolves({ ok: true, tokenId: 'token-1' });

    expect(await verificationApi.verifyUser('token-1')).to.equal('{"verified":true}');
    expect(await verificationApi.getUserInviteToken('invitee@example.com')).to.deep.equal({ tokenId: 'token-1' });
  });

  it('returns HTTP failure bodies but swallows network failures', async () => {
    const httpError = Object.assign(new Error('Not found'), {
      type: 'http_error',
      status: 404,
      body: { message: 'Invite not found' },
    });
    sinon.stub(dataAccessApi.verificationApi, 'getUserInviteTokenByTokenId').rejects(httpError);
    expect(await verificationApi.getUserInviteTokenByTokenId('missing-token')).to.deep.equal({
      message: 'Invite not found',
    });

    const networkError = new Error('offline');
    dataAccessApi.verificationApi.getUserInviteTokenByTokenId.rejects(networkError);
    expect(await verificationApi.getUserInviteTokenByTokenId('missing-token')).to.be.undefined;
  });
});
