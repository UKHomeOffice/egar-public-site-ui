const sinon = require('sinon');
const { expect } = require('chai');

require('../../global.test');

const { FileUploadApi } = require('../../../common/services/data-access/fileUploadApi');
const { fileUploadApi } = require('../../../common/services/dataAccessApi');
const { API_BASE, API_VERSION } = require('../../../common/config');

describe('File Upload API Service', () => {
  const file = {
    originalname: 'example.doc',
    buffer: Buffer.from('supporting document bytes'),
  };
  let client;
  let service;

  beforeEach(() => {
    client = { post: sinon.stub() };
    service = new FileUploadApi(client);
  });

  afterEach(() => {
    sinon.restore();
  });

  it('uploads the original file bytes and filename as multipart form data', async () => {
    const response = { garId: 'NEW-ID' };
    client.post.resolves(response);

    const result = await service.postFile('GAR-ID-1', file);
    const [url, formData] = client.post.firstCall.args;
    const uploadedFile = formData.get('file');

    expect(result).to.equal(response);
    expect(url).to.equal('/gar/GAR-ID-1');
    expect(client.post.calledOnce).to.be.true;
    expect(uploadedFile.name).to.equal(file.originalname);
    expect(Buffer.from(await uploadedFile.arrayBuffer())).to.deep.equal(file.buffer);
  });

  [
    Object.assign(new Error('Upload rejected'), { type: 'http_error', body: { message: 'Not accepted' } }),
    new Error('Network unavailable'),
  ].forEach((error) => {
    it(`propagates upload failures: ${error.message}`, async () => {
      client.post.rejects(error);

      const caught = await service.postFile('GAR-ID-1', file).catch((err) => err);

      expect(caught).to.equal(error);
    });
  });

  it('resolves uploads against the configured API base without duplicating the version', async () => {
    const fetchStub = sinon.stub(global, 'fetch').resolves({ status: 204, ok: true });

    await fileUploadApi.postFile('GAR-ID-1', file);

    const baseUrl = new URL(API_VERSION, API_BASE).href.replace(/\/+$/, '');
    expect(fetchStub.firstCall.args[0].href).to.equal(`${baseUrl}/gar/GAR-ID-1`);
    expect(fetchStub.firstCall.args[1].body).to.be.instanceOf(FormData);
  });
});
