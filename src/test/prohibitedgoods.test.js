const { expect } = require('chai');
const sinon = require('sinon');

require('./global.test');
const garApi = require('../common/services/garApi');
const dataAccessApi = require('../common/services/dataAccessApi');

const garId = 'c2d86db6-006c-4f5e-9e22-e039c8b1ddc7';

const garProhibitedGoodsPartial = {
  status: 'Draft',
  prohibitedGoods: 'True',
};

describe('ProhibitedGoods', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('Should update the GARs prohibited goods detail through the configured GarApi', async () => {
    const patchStub = sinon.stub(dataAccessApi.garApi, 'patch').resolves({ status: { name: 'Draft' } });

    const apiResponse = await garApi.patch(garId, 'Draft', garProhibitedGoodsPartial);

    expect(JSON.parse(apiResponse)).to.deep.equal({ status: { name: 'Draft' } });
    expect(patchStub.calledOnceWithExactly(garId, 'Draft', garProhibitedGoodsPartial)).to.equal(true);
  });
});
