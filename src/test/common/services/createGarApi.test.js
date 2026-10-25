const sinon = require('sinon');
const { expect } = require('chai');

require('../../global.test');
const dataAccessApi = require('../../../common/services/dataAccessApi');
const createGarApi = require('../../../common/services/createGarApi');

describe('Create GAR API Service', () => {
  afterEach(() => sinon.restore());

  it('returns the created GAR response from the configured GarApi as JSON', async () => {
    const response = { ok: true, garId: 'NEW-ID' };
    const createGarStub = sinon.stub(dataAccessApi.garApi, 'createGar').resolves(response);

    expect(await createGarApi.createGar('USER-ID-1')).to.equal(JSON.stringify({ garId: 'NEW-ID' }));
    expect(createGarStub.calledOnceWithExactly('USER-ID-1')).to.equal(true);
  });

  it('preserves the existing undefined response when GAR creation fails', async () => {
    const createGarStub = sinon.stub(dataAccessApi.garApi, 'createGar').rejects(new Error('Unavailable'));

    expect(await createGarApi.createGar('USER-ID-1')).to.be.undefined;
    expect(createGarStub.calledOnceWithExactly('USER-ID-1')).to.equal(true);
  });

  it('returns an HTTP error body in the legacy JSON string shape', async () => {
    const error = new Error('GAR creation failed');
    Object.assign(error, { type: 'http_error', body: { message: 'User cannot create GAR' } });
    const createGarStub = sinon.stub(dataAccessApi.garApi, 'createGar').rejects(error);

    expect(await createGarApi.createGar('USER-ID-1')).to.equal(JSON.stringify(error.body));
    expect(createGarStub.calledOnceWithExactly('USER-ID-1')).to.equal(true);
  });
});
