const sinon = require('sinon');
const chai = require('chai');
const { expect } = chai;
chai.use(require('sinon-chai'));

require('../../global.test');
const config = require('../../../common/config/index');
const tokenApi = require('../../../common/services/data-access/tokenApi');
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
    expect(await api.setToken('token-1', 'user-1')).to.deep.equal({ created: true });
    expect(client.post).to.have.been.calledWithExactly('/user/settoken', {
      tokenId: 'token-1',
      userId: 'user-1',
    });

    expect(await api.updateToken('token-2', 'user-1')).to.deep.equal({ updated: true });
    expect(client.put).to.have.been.calledWithExactly('/user/settoken', {
      tokenId: 'token-2',
      userId: 'user-1',
    });
  });

  it('preserves optional invitee email in organisation invite tokens', async () => {
    expect(await api.setInviteUserToken('token-1', 'inviter-1', 'org-1', 'Admin', 'invitee@example.com')).to.deep.equal(
      { created: true }
    );
    expect(client.post.firstCall.args[0]).to.equal('/user/settoken');
    expect(client.post.firstCall.args[1]).to.deep.equal({
      tokenId: 'token-1',
      inviterId: 'inviter-1',
      organisationId: 'org-1',
      roleName: 'Admin',
      inviteeEmail: 'invitee@example.com',
    });
  });

  it('exports only the class for construction by dataAccessApi', () => {
    expect(Object.keys(tokenApi)).to.deep.equal(['TokenApi']);
  });
});

describe('Generate Hash', () => {
  afterEach(() => sinon.restore());

  it('should successfully generate a hash', () => {
    sinon.stub(config, 'NOTIFY_TOKEN_SECRET').value('example');
    const token = 'randominput'.toString();
    const output = genToken.generateHash(token);

    expect(output).not.to.equal(token);
    expect(output.length).to.eq(64);
  });
});
