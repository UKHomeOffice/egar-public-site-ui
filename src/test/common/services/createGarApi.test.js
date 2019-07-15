/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */
const sinon = require('sinon');
const { expect } = require('chai');
const chai = require('chai');
const sinonChai = require('sinon-chai');
const proxyquire = require('proxyquire');

const config = require('../../../common/config/index');

describe('Create GAR API Service', () => {
  const { API_VERSION } = config;

  beforeEach(() => {
    chai.use(sinonChai);
    process.on('unhandledRejection', (error) => {
      chai.assert.fail(`Unhandled rejection encountered: ${error}`);
    });
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should do nothing if request throws error', async () => {
    const requestStub = sinon.stub().throws('request.post Throw Error');
    const proxiedService = proxyquire('../../../common/services/createGarApi', {
      request: { post: requestStub },
    });

    await proxiedService.createGar('USER-ID-1');

    expect(requestStub).to.have.been.calledOnceWith({
      headers: { 'content-type': 'application/json' },
      url: `http://localhost:5000/${API_VERSION}/user/USER-ID-1/gar`,
    });
  });

  it('should reject if error present', async () => {
    const requestStub = sinon.stub().yields('Example Error', null, null);
    const proxiedService = proxyquire('../../../common/services/createGarApi', {
      request: { post: requestStub },
    });

    const result = await proxiedService.createGar('USER-ID-1');

    expect(requestStub).to.have.been.calledOnceWith({
      headers: { 'content-type': 'application/json' },
      url: `http://localhost:5000/${API_VERSION}/user/USER-ID-1/gar`,
    });
    expect(result).to.be.undefined;
  });

  it('should return if ok', async () => {
    const apiResponse = {
      garId: 'NEW-ID',
    };
    const requestStub = sinon.stub().yields(null, apiResponse, JSON.stringify(apiResponse));
    const proxiedService = proxyquire('../../../common/services/createGarApi', {
      request: { post: requestStub },
    });

    const result = await proxiedService.createGar('USER-ID-1');

    expect(requestStub).to.have.been.calledOnceWith({
      headers: { 'content-type': 'application/json' },
      url: `http://localhost:5000/${API_VERSION}/user/USER-ID-1/gar`,
    });
    expect(result).to.eql(JSON.stringify(apiResponse));
  });
});
