const { expect } = require('chai');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');

require('../../global.test');
chai.use(sinonChai);
const craftApi = require('../../../common/services/craftApi');
const dataAccessApi = require('../../../common/services/dataAccessApi');

describe('CraftApi', () => {
  const userId = 'user-1';
  const orgId = 'org-1';
  const craftId = 'craft-1';
  const craft = { registration: 'G-ABCD', craftType: 'Cessna', craftBase: 'LHR' };
  let client;
  let api;

  beforeEach(() => {
    client = {
      get: sinon.stub().resolves({ craft }),
      post: sinon.stub().resolves({ craftId }),
      put: sinon.stub().resolves({ craftId }),
      delete: sinon.stub().resolves({}),
    };
    api = new craftApi.CraftApi(client);
  });

  afterEach(() => sinon.restore());

  it('creates a craft', async () => {
    await api.create(craft.registration, craft.craftType, craft.craftBase, userId);
    expect(client.post).to.have.been.calledOnceWithExactly('/user/user-1/crafts', craft);
  });

  it('gets a craft by ID', async () => {
    await api.getDetails(userId, craftId);
    expect(client.get).to.have.been.calledOnceWithExactly('/user/user-1/crafts/craft-1');
  });

  it('gets individual crafts with pagination', async () => {
    await api.getCrafts(userId, 3);
    expect(client.get).to.have.been.calledOnceWithExactly('/user/user-1/crafts', {
      query: { per_page: 5, page: 3 },
    });
  });

  it('gets organisation crafts with pagination', async () => {
    await api.getOrgCrafts(orgId, 4);
    expect(client.get).to.have.been.calledOnceWithExactly('/organisations/org-1/crafts', {
      query: { per_page: 5, page: 4 },
    });
  });

  it('updates a craft', async () => {
    await api.update(craft.registration, craft.craftType, craft.craftBase, userId, craftId);
    expect(client.put).to.have.been.calledOnceWithExactly('/user/user-1/crafts/craft-1', craft);
  });

  it('deletes an individual craft with the original requester payload', async () => {
    await api.deleteCraft(userId, craftId);
    expect(client.delete).to.have.been.calledOnceWithExactly('/user/user-1/crafts/craft-1', {
      body: { requesterId: userId, crafts: [{ craftId }] },
    });
  });

  it('deletes an organisation craft from its collection endpoint', async () => {
    await api.deleteOrgCraft(orgId, userId, craftId);
    expect(client.delete).to.have.been.calledOnceWithExactly('/organisations/org-1/crafts', {
      body: { requesterId: userId, crafts: [{ craftId }] },
    });
  });

  it('preserves the legacy string response and propagates network errors', async () => {
    const getStub = sinon.stub(dataAccessApi.craftApi, 'getDetails').resolves({ ok: true, craftId });
    expect(await craftApi.getDetails(userId, craftId)).to.equal(JSON.stringify({ craftId }));

    const networkError = new Error('offline');
    getStub.rejects(networkError);
    try {
      await craftApi.getDetails(userId, craftId);
      expect.fail('Expected the network error to be propagated');
    } catch (error) {
      expect(error).to.equal(networkError);
    }
  });
});
