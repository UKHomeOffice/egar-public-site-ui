const { expect } = require('chai');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');

require('../../global.test');
chai.use(sinonChai);
const resPersonApi = require('../../../common/services/data-access/resPersonApi');

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
    expect(client.post).to.have.been.calledOnceWithExactly('/user/user-1/responsiblepersons', person);
  });

  it('lists saved responsible persons', async () => {
    await api.getResPersons(userId);
    expect(client.get).to.have.been.calledOnceWithExactly('/user/user-1/responsiblepersons');
  });

  it('gets responsible person details', async () => {
    await api.getResPersonDetails(userId, responsiblePersonId);
    expect(client.get).to.have.been.calledOnceWithExactly('/user/user-1/responsibleperson/responsible-person-1');
  });

  it('updates responsible person details', async () => {
    await api.updateResPerson(userId, responsiblePersonId, person);
    expect(client.put).to.have.been.calledOnceWithExactly(
      '/user/user-1/responsibleperson/responsible-person-1',
      person
    );
  });

  it('deletes a responsible person', async () => {
    await api.deleteResponsiblePerson(userId, responsiblePersonId);
    expect(client.delete).to.have.been.calledOnceWithExactly('/user/user-1/responsibleperson/responsible-person-1');
  });

  it('exports only the class for construction by dataAccessApi', () => {
    expect(Object.keys(resPersonApi)).to.deep.equal(['ResPersonApi']);
  });

  [
    ['create', 'post', [userId, person]],
    ['getResPersons', 'get', [userId]],
    ['getResPersonDetails', 'get', [userId, responsiblePersonId]],
    ['updateResPerson', 'put', [userId, responsiblePersonId, person]],
    ['deleteResponsiblePerson', 'delete', [userId, responsiblePersonId]],
  ].forEach(([method, verb, args]) => {
    it(`returns the client response unchanged from ${method}`, async () => {
      const response = { person };
      client[verb].resolves(response);

      expect(await api[method](...args)).to.equal(response);
    });

    ['http_error', 'network_error', 'timeout_error'].forEach((type) => {
      it(`propagates ${type} failures unchanged from ${method}`, async () => {
        const failure = Object.assign(new Error('Request failed'), {
          type,
          status: 400,
          body: { message: 'Invalid responsible person' },
        });
        client[verb].rejects(failure);

        try {
          await api[method](...args);
          expect.fail('Expected the client error to be propagated');
        } catch (error) {
          expect(error).to.equal(failure);
        }
      });
    });
  });
});
