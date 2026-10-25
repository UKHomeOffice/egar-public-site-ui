const sinon = require('sinon');
const { expect } = require('chai');

require('../../global.test');

const fileUploadApi = require('../../../common/services/fileUploadApi');
const { FileUploadApi } = fileUploadApi;
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
    client.post.resolves('{"garId":"NEW-ID"}');

    const result = await service.postFile('GAR-ID-1', file);
    const [url, formData] = client.post.firstCall.args;
    const uploadedFile = formData.get('file');

    expect(result).to.equal('{"garId":"NEW-ID"}');
    expect(url).to.equal('/gar/GAR-ID-1');
    expect(client.post.calledOnce).to.be.true;
    expect(uploadedFile.name).to.equal(file.originalname);
    expect(Buffer.from(await uploadedFile.arrayBuffer())).to.deep.equal(file.buffer);
  });

  it('returns the response body for an HTTP error, as the previous upload client did', async () => {
    client.post.rejects(Object.assign(new Error('Upload rejected'), { type: 'http_error', body: 'not accepted' }));

    expect(await service.postFile('GAR-ID-1', file)).to.equal('not accepted');
  });

  it('resolves uploads against the configured API base without duplicating the version', async () => {
    const fetchStub = sinon.stub(global, 'fetch').resolves({ status: 204, ok: true });

    await fileUploadApi.postFile('GAR-ID-1', file);

    const baseUrl = new URL(API_VERSION, API_BASE).href.replace(/\/+$/, '');
    expect(fetchStub.firstCall.args[0].href).to.equal(`${baseUrl}/gar/GAR-ID-1`);
    expect(fetchStub.firstCall.args[1].body).to.be.instanceOf(FormData);
  });

  it('resolves undefined when the upload request fails', async () => {
    client.post.rejects(new Error('Network unavailable'));

    expect(await service.postFile('GAR-ID-1', file)).to.be.undefined;
  });
});
