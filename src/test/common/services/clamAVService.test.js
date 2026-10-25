const sinon = require('sinon');
const { expect } = require('chai');

require('../../global.test');

const { ClamAVService } = require('../../../common/services/clamAVService');

describe('ClamAV Service', () => {
  const file = {
    originalname: 'example.doc',
    buffer: Buffer.from('supporting document bytes'),
  };
  let client;
  let service;

  beforeEach(() => {
    client = { post: sinon.stub() };
    service = new ClamAVService(client);
  });

  afterEach(() => {
    sinon.restore();
  });

  async function expectMultipartFile() {
    const [path, formData] = client.post.firstCall.args;
    const uploadedFile = formData.get('file');

    expect(path).to.equal('/scan');
    expect(formData.get('name')).to.equal(file.originalname);
    expect(uploadedFile.name).to.equal(file.originalname);
    expect(Buffer.from(await uploadedFile.arrayBuffer())).to.deep.equal(file.buffer);
  }

  it('resolves true when ClamAV reports a clean file', async () => {
    client.post.resolves('ok : true');

    expect(await service.scanFile(file)).to.be.true;
    await expectMultipartFile();
  });

  it('resolves false when ClamAV reports an infected file', async () => {
    client.post.resolves('ok : false');

    expect(await service.scanFile(file)).to.be.false;
    await expectMultipartFile();
  });

  it('returns undefined for an unexpected text response', async () => {
    client.post.resolves('unexpected response');

    expect(await service.scanFile(file)).to.be.undefined;
    await expectMultipartFile();
  });

  it('interprets text response bodies returned with an HTTP error', async () => {
    client.post.rejects(Object.assign(new Error('HTTP error'), { type: 'http_error', body: 'ok : true' }));

    expect(await service.scanFile(file)).to.be.true;
    await expectMultipartFile();
  });

  it('returns undefined when the scan request fails', async () => {
    client.post.rejects(new Error('Network unavailable'));

    expect(await service.scanFile(file)).to.be.undefined;
    await expectMultipartFile();
  });
});
