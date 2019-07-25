/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */

const sinon = require('sinon');
const { expect } = require('chai');
const chai = require('chai');
const sinonChai = require('sinon-chai');
const proxyquire = require('proxyquire');
const { URL } = require('url');

require('../../global.test');

const config = require('../../../common/config/index');

describe('File Upload API Service', () => {
  const { API_VERSION, API_BASE } = config;
  const BASE_URL = new URL(API_VERSION, API_BASE).href;
  const file = {
    originalname: 'example.doc',
    buffer: Buffer.alloc(10000),
  };

  beforeEach(() => {
    chai.use(sinonChai);
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should do nothing if request throws error', async () => {
    const requestStub = sinon.stub().throws('request.post Throw Error');
    const proxiedService = proxyquire('../../../common/services/fileUploadApi', {
      request: { post: requestStub },
    });

    await proxiedService.postFile('GAR-ID-1', file);

    expect(requestStub).to.have.been.calledOnceWith({
      headers: { 'content-type': 'multipart/form-data' },
      uri: `${BASE_URL}/gar/GAR-ID-1`,
      formData: {
        file: {
          options: { filename: 'example.doc' },
          value: file.buffer,
        },
      },
    });
  });

  it('should reject if error present', async () => {
    const requestStub = sinon.stub().yields('Example Error', null, null);
    const proxiedService = proxyquire('../../../common/services/fileUploadApi', {
      request: { post: requestStub },
    });

    const result = await proxiedService.postFile('GAR-ID-1', file);

    expect(requestStub).to.have.been.calledOnceWith({
      headers: { 'content-type': 'multipart/form-data' },
      uri: `${BASE_URL}/gar/GAR-ID-1`,
      formData: {
        file: {
          options: { filename: 'example.doc' },
          value: file.buffer,
        },
      },
    });
    expect(result).to.be.undefined;
  });

  it('should return if ok', async () => {
    const apiResponse = {
      garId: 'NEW-ID',
    };

    const requestStub = sinon.stub().yields(null, apiResponse, JSON.stringify(apiResponse));
    const proxiedService = proxyquire('../../../common/services/fileUploadApi', {
      request: { post: requestStub },
    });

    const result = await proxiedService.postFile('GAR-ID-1', file);

    expect(requestStub).to.have.been.calledOnceWith({
      headers: { 'content-type': 'multipart/form-data' },
      uri: `${BASE_URL}/gar/GAR-ID-1`,
      formData: {
        file: {
          options: { filename: 'example.doc' },
          value: file.buffer,
        },
      },
    });
    expect(result).to.eql(JSON.stringify(apiResponse));
  });
});
