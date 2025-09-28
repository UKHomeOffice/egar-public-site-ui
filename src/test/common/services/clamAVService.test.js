/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */

import sinon from 'sinon';
import { expect } from 'chai';
import chai from 'chai';
import sinonChai from 'sinon-chai';
import esmock from 'esmock';
import '../../global.test.js';
import config from '../../../common/config/index.js';

describe('File Upload API Service', () => {
  const file = {
    originalname: 'example.doc',
    buffer: Buffer.alloc(10000),
  };

  beforeEach(() => {
    chai.use(sinonChai);
    sinon.stub(config, 'CLAMAV_BASE').value('clamav');
    sinon.stub(config, 'CLAMAV_PORT').value('5555');
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should do nothing if request throws error', async () => {
    const requestStub = sinon.stub().throws('request.post Throw Error');
    const proxiedService = await esmock('../../../common/services/clamAVService.js', {
      'request': { post: requestStub },
    });

    await proxiedService.scanFile(file);

    expect(requestStub).to.have.been.calledOnceWith({
      headers: { 'content-type': 'multipart/form-data' },
      uri: 'clamav:5555/scan',
      formData: {
        originalname: 'example.doc',
        buffer: file.buffer,
      },
    });
  });

  it('should reject if error present', async () => {
    const requestStub = sinon.stub().yields(new Error('Example Error'), null, null);
    const proxiedService = await esmock('../../../common/services/clamAVService.js', {
      'request': { post: requestStub },
    });

    const result = await proxiedService.scanFile(file);

    expect(requestStub).to.have.been.calledOnceWith({
      headers: { 'content-type': 'multipart/form-data' },
      uri: 'clamav:5555/scan',
      formData: {
        originalname: 'example.doc',
        buffer: file.buffer,
      },
    });
    expect(result).to.be.undefined;
  });

  it('should resolve if ok is true', async () => {
    const apiResponse = 'ok : true';

    const requestStub = sinon.stub().yields(null, apiResponse, JSON.stringify(apiResponse));
    const proxiedService = await esmock('../../../common/services/clamAVService.js', {
      'request': { post: requestStub },
    });

    const result = await proxiedService.scanFile(file);
    
    expect(requestStub).to.have.been.calledOnceWith({
      headers: { 'content-type': 'multipart/form-data' },
      uri: 'clamav:5555/scan',
      formData: {
        originalname: 'example.doc',
        buffer: file.buffer,
      },
    });
    expect(result).to.be.true;
  });

  it('should resolve if ok is false', async () => {
    const apiResponse = 'ok : false';

    const requestStub = sinon.stub().yields(null, apiResponse, JSON.stringify(apiResponse));
    const proxiedService = await esmock('../../../common/services/clamAVService.js', {
      'request': { post: requestStub },
    });

    const result = await proxiedService.scanFile(file);
    
    expect(requestStub).to.have.been.calledOnceWith({
      headers: { 'content-type': 'multipart/form-data' },
      uri: 'clamav:5555/scan',
      formData: {
        originalname: 'example.doc',
        buffer: file.buffer,
      },
    });
    expect(result).to.be.false;
  });

  it('should reject if ok is not true or false', async () => {
    const apiResponse = 'something else';

    const requestStub = sinon.stub().yields(null, apiResponse, JSON.stringify(apiResponse));
    const proxiedService = await esmock('../../../common/services/clamAVService.js', {
      'request': { post: requestStub },
    });

    const result = await proxiedService.scanFile(file);
    
    expect(requestStub).to.have.been.calledOnceWith({
      headers: { 'content-type': 'multipart/form-data' },
      uri: 'clamav:5555/scan',
      formData: {
        originalname: 'example.doc',
        buffer: file.buffer,
      },
    });
    // chai-as-promised would probably inspect if its rejected?
    expect(result).to.be.undefined;
  });
});