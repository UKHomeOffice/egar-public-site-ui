const { expect } = require('chai');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');

require('../../global.test');
chai.use(sinonChai);
const resPersonApi = require('../../../common/services/resPersonApi');
const dataAccessApi = require('../../../common/services/dataAccessApi');
const endpoints = require('../../../common/config/endpoints');
const API_PREFIX = new URL(endpoints.baseUrl()).pathname.replace(/\/$/, '');

describe('ResPersonApi', () => {
  const userId = 'user-1';
  const responsiblePersonId = 'responsible-person-1';
  const person = { responsibleGivenName: 'Ada', responsibleSurname: 'Lovelace' };
  let client;
  let api;

  beforeEach(() => {
    client = {
      get: sinon.stub().resolves({ responsiblePerson: person }),
      post: sinon.stub().resolves({ responsiblePersonId }),
      put: sinon.stub().resolves({ responsiblePersonId }),
      delete: sinon.stub().resolves({}),
    };
    api = new resPersonApi.ResPersonApi(client);
  });

  afterEach(() => sinon.restore());

  it('creates a responsible person', async () => {
    await api.create(userId, person);
    expect(client.post).to.have.been.calledOnceWithExactly(`${API_PREFIX}/user/user-1/responsiblepersons`, person);
  });

  it('lists saved responsible persons', async () => {
    await api.getResPersons(userId);
    expect(client.get).to.have.been.calledOnceWithExactly(`${API_PREFIX}/user/user-1/responsiblepersons`);
  });

  it('gets responsible person details', async () => {
    await api.getResPersonDetails(userId, responsiblePersonId);
    expect(client.get).to.have.been.calledOnceWithExactly(
      `${API_PREFIX}/user/user-1/responsibleperson/responsible-person-1`
    );
  });

  it('updates responsible person details', async () => {
    await api.updateResPerson(userId, responsiblePersonId, person);
    expect(client.put).to.have.been.calledOnceWithExactly(
      `${API_PREFIX}/user/user-1/responsibleperson/responsible-person-1`,
      person
    );
  });

  it('deletes a responsible person', async () => {
    await api.deleteResponsiblePerson(userId, responsiblePersonId);
    expect(client.delete).to.have.been.calledOnceWithExactly(
      `${API_PREFIX}/user/user-1/responsibleperson/responsible-person-1`
    );
  });

  it('preserves the legacy string response and maps HTTP failures to their response body', async () => {
    const getStub = sinon.stub(dataAccessApi.resPersonApi, 'getResPersonDetails').resolves({ ok: true, person });
    expect(await resPersonApi.getResPersonDetails(userId, responsiblePersonId)).to.equal(JSON.stringify({ person }));

    const error = Object.assign(new Error('Unavailable'), {
      type: 'http_error',
      body: { message: 'Unavailable' },
    });
    getStub.rejects(error);
    expect(await resPersonApi.getResPersonDetails(userId, responsiblePersonId)).to.equal(JSON.stringify(error.body));
  });
});
