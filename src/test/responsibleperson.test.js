const { expect } = require('chai');
const sinon = require('sinon');

require('./global.test');
const garApi = require('../common/services/garApi');
const dataAccessApi = require('../common/services/dataAccessApi');

const garId = 'c2d86db6-006c-4f5e-9e22-e039c8b1ddc7';

const garResponsiblePersonPartial = {
  status: 'Draft',
  responsibleGivenName: 'Joe',
  responsibleSurname: 'Pike',
  responsibleContactNo: '08078953493',
  responsibleEmail: 'fake@test.com',
  responsibleAddressLine1: 'Buckingham Palace',
  responsibleAddressLine2: 'Buckingham Palace Road',
  responsibleTown: 'London',
  responsiblePostcode: 'SW111A',
  responsibleCountry: 'GBR',
  fixedBasedOperator: 'Captain',
  fixedBasedOperatorAnswer: '',
};

describe('ResponsiblePerson', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('Should update the GARs responsible person details through the configured GarApi', async () => {
    const patchStub = sinon.stub(dataAccessApi.garApi, 'patch').resolves({ status: { name: 'Draft' } });

    const apiResponse = await garApi.patch(garId, 'Draft', garResponsiblePersonPartial);

    expect(JSON.parse(apiResponse)).to.deep.equal({ status: { name: 'Draft' } });
    expect(patchStub.calledOnceWithExactly(garId, 'Draft', garResponsiblePersonPartial)).to.equal(true);
  });
});
