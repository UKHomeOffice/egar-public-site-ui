const chai = require('chai');
const sinon = require('sinon');

chai.use(require('sinon-chai'));
const { expect } = chai;
require('../../global.test');
const organisationApiService = require('../../../common/services/data-access/organisationApi');

const orgId = 'organisation-1';
const userId = 'user-1';
const user = { userId, firstName: 'Ada', lastName: 'Lovelace', role: 'Manager' };

describe('OrganisationApi', () => {
  let client;
  let api;

  beforeEach(() => {
    client = {
      post: sinon.stub().resolves({ organisationId: orgId }),
      put: sinon.stub().resolves({ organisationName: 'New name' }),
      get: sinon.stub().resolves({ items: [] }),
      delete: sinon.stub().resolves({ deleted: true }),
      patch: sinon.stub().resolves({ updated: true }),
    };
    api = new organisationApiService.OrganisationApi(client);
  });

  afterEach(() => sinon.restore());

  it('creates an organisation with the owner ID', async () => {
    await api.create('Example organisation', userId);
    expect(client.post).to.have.been.calledOnceWithExactly('/organisations', {
      organisationName: 'Example organisation',
      userId,
    });
  });

  it('updates an organisation name', async () => {
    await api.update('New name', orgId);
    expect(client.put).to.have.been.calledOnceWithExactly(`/organisations/${orgId}`, {
      organisationName: 'New name',
    });
  });

  it('gets an organisation', async () => {
    await api.get(orgId);
    expect(client.get).to.have.been.calledOnceWithExactly(`/organisations/${orgId}`);
  });

  it('deletes an organisation with the requesting user ID', async () => {
    await api.delete(orgId, userId);
    expect(client.delete).to.have.been.calledOnceWithExactly(`/organisations/${orgId}`, {
      body: { requesterId: userId },
    });
  });

  it('gets paginated organisation users', async () => {
    await api.getUsers(orgId, 3, 10);
    expect(client.get).to.have.been.calledOnceWithExactly(`/organisations/${orgId}/users`, {
      query: { per_page: 10, page: 3 },
    });
  });

  it('gets all organisation users with an optional role filter', async () => {
    await api.getListOfOrgUsers(orgId, 'Admin');
    expect(client.get).to.have.been.calledOnceWithExactly(`/organisations/${orgId}/users`, {
      query: { role: 'Admin' },
    });

    client.get.resetHistory();
    await api.getListOfOrgUsers(orgId);
    expect(client.get).to.have.been.calledOnceWithExactly(`/organisations/${orgId}/users`, {
      query: undefined,
    });
  });

  it('edits an organisation user with the requesting ID and user details', async () => {
    await api.editUser(userId, orgId, user);
    expect(client.patch).to.have.been.calledOnceWithExactly(`/organisations/${orgId}/users`, {
      requesterId: userId,
      users: [user],
    });
  });

  it('deletes an organisation user with the requesting ID and user details', async () => {
    await api.deleteUser(userId, orgId, user);
    expect(client.delete).to.have.been.calledOnceWithExactly(`/organisations/${orgId}/users`, {
      body: { requesterId: userId, users: [user] },
    });
  });

  it('searches organisation users by name', async () => {
    await api.getSearchOrgUsers(orgId, 'Ada Lovelace');
    expect(client.get).to.have.been.calledOnceWithExactly(`/organisations/${orgId}/users/search`, {
      query: { searchName: 'Ada Lovelace' },
    });
  });

  it('looks up a user by ID', async () => {
    await api.getUserById(userId);
    expect(client.get).to.have.been.calledOnceWithExactly('/user/search', {
      query: { user_id: userId },
    });
  });

  it('exports only the class for construction by dataAccessApi', () => {
    expect(Object.keys(organisationApiService)).to.deep.equal(['OrganisationApi']);
  });

  [
    ['create', 'post', ['Example', userId]],
    ['update', 'put', ['New name', orgId]],
    ['get', 'get', [orgId]],
    ['delete', 'delete', [orgId, userId]],
    ['getUsers', 'get', [orgId, 1, 5]],
    ['getListOfOrgUsers', 'get', [orgId]],
    ['editUser', 'patch', [userId, orgId, user]],
    ['deleteUser', 'delete', [userId, orgId, user]],
    ['getSearchOrgUsers', 'get', [orgId, 'Ada']],
    ['getUserById', 'get', [userId]],
  ].forEach(([method, verb, args]) => {
    it(`returns the client response unchanged from ${method}`, async () => {
      const response = { result: true };
      client[verb].resolves(response);
      expect(await api[method](...args)).to.equal(response);
    });

    ['http_error', 'network_error', 'timeout_error'].forEach((type) => {
      it(`propagates ${type} failures unchanged from ${method}`, async () => {
        const failure = Object.assign(new Error('Request failed'), {
          type,
          status: 409,
          body: { message: 'Conflict' },
        });
        client[verb].rejects(failure);
        try {
          await api[method](...args);
          expect.fail('Expected the request to reject');
        } catch (err) {
          expect(err).to.equal(failure);
        }
      });
    });
  });
});
