/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */
const sinon = require('sinon');
const { expect } = require('chai');
const chai = require('chai');
const sinonChai = require('sinon-chai');
const proxyquire = require('proxyquire');
const { URL } = require('url');

const config = require('../../../common/config/index');

describe('Craft API Service', () => {
  const { API_VERSION, API_BASE } = config;
  const BASE_URL = new URL(API_VERSION, API_BASE).href;

  beforeEach(() => {
    chai.use(sinonChai);
    process.on('unhandledRejection', (error) => {
      chai.assert.fail(`Unhandled rejection encountered: ${error}`);
    });
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('create', () => {
    it('should do nothing if request throws error', async () => {
      const requestStub = sinon.stub().throws('request.post Throw Error');
      const proxiedService = proxyquire('../../../common/services/craftApi', {
        request: { post: requestStub },
      });

      await proxiedService.create('RIP-AFTC', 'A380', 'LHR', 'USER-ID-1');

      expect(requestStub).to.have.been.calledOnceWith({
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ registration: 'RIP-AFTC', craftType: 'A380', craftBase: 'LHR' }),
        url: `${BASE_URL}/user/USER-ID-1/crafts`,
      });
    });

    it('should reject if error present', async () => {
      const requestStub = sinon.stub().yields('Example Error', null, null);
      const proxiedService = proxyquire('../../../common/services/craftApi', {
        request: { post: requestStub },
      });

      const result = await proxiedService.create('RIP-AFTC', 'A380', 'LHR', 'USER-ID-1');

      expect(requestStub).to.have.been.calledOnceWith({
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ registration: 'RIP-AFTC', craftType: 'A380', craftBase: 'LHR' }),
        url: `${BASE_URL}/user/USER-ID-1/crafts`,
      });
      expect(result).to.be.undefined;
    });

    it('should return if ok', async () => {
      const apiResponse = {
        craftId: 'NEW-ID',
      };
      const requestStub = sinon.stub().yields(null, apiResponse, JSON.stringify(apiResponse));
      const proxiedService = proxyquire('../../../common/services/craftApi', {
        request: { post: requestStub },
      });

      const result = await proxiedService.create('RIP-AFTC', 'A380', 'LHR', 'USER-ID-1');

      expect(requestStub).to.have.been.calledOnceWith({
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ registration: 'RIP-AFTC', craftType: 'A380', craftBase: 'LHR' }),
        url: `${BASE_URL}/user/USER-ID-1/crafts`,
      });
      expect(result).to.eql(JSON.stringify(apiResponse));
    });
  });

  // getDetails

  // getCrafts

  // getOrgCrafts
});
