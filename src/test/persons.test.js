const { expect } = require('chai');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');

require('./global.test');
chai.use(sinonChai);
const personApi = require('../common/services/data-access/personApi');
const { HttpClient } = require('../common/services/httpClient');

describe('PersonApi', () => {
  const userId = 'user-1';
  const orgId = 'org-1';
  const personId = 'person-1';
  const person = {
    firstName: 'Ada',
    lastName: 'Lovelace',
    nationality: 'GBR',
    placeOfBirth: 'London',
    dateOfBirth: '1815-12-10',
    gender: 'Female',
    documentType: 'Passport',
    documentNumber: '12345',
    documentExpiryDate: '2030-01-01',
    peopleType: 'Crew',
    issuingState: 'GBR',
    documentDesc: 'Passport',
    ignored: true,
  };
  const response = { people: [] };
  let client;
  let api;

  beforeEach(() => {
    client = {
      get: sinon.stub().resolves(response),
      post: sinon.stub().resolves(response),
      put: sinon.stub().resolves(response),
      delete: sinon.stub().resolves(response),
    };
    api = new personApi.PersonApi(client);
  });

  afterEach(() => sinon.restore());

  it('creates a saved person with the existing endpoint and request body', async () => {
    await api.create(userId, person);
    expect(client.post).to.have.been.calledOnceWithExactly('/user/user-1/people', person);
  });

  it('gets saved person details', async () => {
    await api.getDetails(userId, personId);
    expect(client.get).to.have.been.calledOnceWithExactly('/user/user-1/people/person-1');
  });

  it('resolves a base-relative path to the original endpoint without duplicating the API version', async () => {
    const fetchStub = sinon.stub(global, 'fetch').resolves({
      status: 200,
      ok: true,
      headers: { get: () => 'application/json' },
      text: async () => JSON.stringify(response),
    });
    const fetchApi = new personApi.PersonApi(new HttpClient({ baseUrl: 'https://api.example.test/v1' }));

    await fetchApi.getDetails(userId, personId);

    expect(fetchStub.firstCall.args[0].href).to.equal('https://api.example.test/v1/user/user-1/people/person-1');
  });

  it('gets saved people for individuals and organisations', async () => {
    await api.getPeople(userId, 'individual');
    await api.getPeople(orgId, 'ORGANISATION');

    expect(client.get.firstCall.args).to.deep.equal(['/user/user-1/people']);
    expect(client.get.secondCall.args).to.deep.equal(['/organisations/org-1/people']);
  });

  it('updates only the supported saved-person fields', async () => {
    await api.update(userId, personId, person);

    expect(client.put).to.have.been.calledOnceWithExactly('/user/user-1/people/person-1', {
      firstName: 'Ada',
      lastName: 'Lovelace',
      nationality: 'GBR',
      placeOfBirth: 'London',
      dateOfBirth: '1815-12-10',
      gender: 'Female',
      documentType: 'Passport',
      documentNumber: '12345',
      documentExpiryDate: '2030-01-01',
      peopleType: 'Crew',
      issuingState: 'GBR',
      documentDesc: 'Passport',
    });
  });

  it('deletes a saved person', async () => {
    await api.deletePerson(userId, personId);
    expect(client.delete).to.have.been.calledOnceWithExactly('/user/user-1/people/person-1');
  });

  it('exports only the class for construction by dataAccessApi', () => {
    expect(Object.keys(personApi)).to.deep.equal(['PersonApi']);
  });

  [
    ['create', 'post', [userId, { people: [person] }]],
    ['getDetails', 'get', [userId, personId]],
    ['getPeople', 'get', [userId, 'individual']],
    ['update', 'put', [userId, personId, person]],
    ['deletePerson', 'delete', [userId, personId]],
  ].forEach(([method, verb, args]) => {
    it(`returns the client response unchanged from ${method}`, async () => {
      expect(await api[method](...args)).to.equal(response);
    });

    ['http_error', 'network_error', 'timeout_error'].forEach((type) => {
      it(`propagates ${type} failures unchanged from ${method}`, async () => {
        const failure = Object.assign(new Error('Request failed'), {
          type,
          status: 400,
          body: { message: 'Invalid person' },
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
