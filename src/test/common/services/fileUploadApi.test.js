/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */

import sinon from 'sinon';
import { expect } from 'chai';
import chai from 'chai';
import sinonChai from 'sinon-chai';
import esmock from 'esmock';
import { URL } from 'url';
import '../../global.test.js';
import config from '../../../common/config/index.js';

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
    const proxiedService = await esmock('../../../common/services/fileUploadApi.js', {
      'request': { post: requestStub },
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
    const proxiedService = await esmock('../../../common/services/fileUploadApi.js', {
      'request': { post: requestStub },
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
    const proxiedService = await esmock('../../../common/services/fileUploadApi.js', {
      'request': { post: requestStub },
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