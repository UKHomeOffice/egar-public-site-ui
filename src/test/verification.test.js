const sinon = require('sinon');
const { expect } = require('chai');
require('chai').use(require('sinon-chai'));

require('./global.test');
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
    expect(await api.verifyUser('token-1')).to.deep.equal({ verified: true });
    expect(client.put).to.have.been.calledOnceWithExactly('/user/verify', { tokenId: 'token-1' });
  });

  it('looks up invite tokens with the expected email, service, and token filters', async () => {
    expect(await api.getUserInviteToken('invitee@example.com')).to.deep.equal({ tokenId: 'token-1' });
    expect(client.get).to.have.been.calledWithExactly('/user/verify', {
      query: { invitee_email: 'invitee@example.com', service: 'sgar' },
    });

    expect(await api.getUserInviteTokenByTokenId('token-1')).to.deep.equal({ tokenId: 'token-1' });
    expect(client.get.secondCall.args).to.deep.equal(['/user/verify', { query: { token_id: 'token-1' } }]);
  });

  it('exports only the class for construction by dataAccessApi', () => {
    expect(Object.keys(verificationApi)).to.deep.equal(['VerificationApi']);
  });

  [
    ['verifyUser', 'put'],
    ['getUserInviteToken', 'get'],
    ['getUserInviteTokenByTokenId', 'get'],
  ].forEach(([method, verb]) => {
    it(`propagates client rejections unchanged from ${method}`, async () => {
      const error = Object.assign(new Error('Bad Request'), {
        type: 'http_error',
        status: 400,
        body: { message: 'Token expired' },
      });
      client[verb].rejects(error);
      try {
        await api[method]('token-or-email');
        expect.fail('Expected request to reject');
      } catch (actual) {
        expect(actual).to.equal(error);
      }
    });
  });
});
