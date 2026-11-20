const sinon = require('sinon');
const chai = require('chai');
chai.use(require('sinon-chai'));
const { expect } = chai;

require('../../global.test');
const { garApi, fileUploadApi } = require('../../../common/services/dataAccessApi');
const clamAVService = require('../../../common/services/clamAVService');
const controller = require('../../../app/api/uploadfile/post.controller');

describe('API upload file post controller', () => {
  let req;
  let res;
  let lookup;
  let remove;
  let scan;
  let upload;

  beforeEach(() => {
    const buffer = Buffer.alloc(10000);
    buffer.write('%PDF');
    req = {
      file: { originalname: 'test-gar.pdf', buffer, size: 10000 },
      body: { garid: 'untrusted-gar' },
      session: {},
    };
    res = { redirect: sinon.spy(), locals: { gar: { garId: 'GAR-1' } } };
    lookup = sinon.stub(garApi, 'getSupportingDocs').resolves({ items: [] });
    remove = sinon.stub(garApi, 'deleteGarSupportingDoc').resolves({});
    scan = sinon.stub(clamAVService, 'scanFile').resolves(true);
    upload = sinon.stub(fileUploadApi, 'postFile').resolves({});
  });

  afterEach(() => sinon.restore());

  function expectUploadStopped(query) {
    expect(scan).not.to.have.been.called;
    expect(upload).not.to.have.been.called;
    expect(res.redirect).to.have.been.calledOnceWithExactly(`/garfile/supportingdocuments?query=${query}`);
  }

  it('rejects a missing file without looking up documents', async () => {
    delete req.file;
    await controller(req, res);
    expect(lookup).not.to.have.been.called;
    expect(remove).not.to.have.been.called;
    expectUploadStopped('0');
  });

  it('deletes a document against the verified GAR without processing an upload', async () => {
    req.body.deleteDocId = 'DOCUMENT-1';
    await controller(req, res);
    expect(remove).to.have.been.calledOnceWithExactly('GAR-1', 'DOCUMENT-1');
    expect(lookup).not.to.have.been.called;
    expect(scan).not.to.have.been.called;
    expect(upload).not.to.have.been.called;
    expect(res.redirect).to.have.been.calledOnceWithExactly('/garfile/supportingdocuments');
  });

  it('redirects to deletion failure when the backend rejects the deletion', async () => {
    req.body.deleteDocId = 'DOCUMENT-1';
    remove.rejects(
      Object.assign(new Error('Not Found'), {
        type: 'http_error',
        status: 404,
        body: { message: 'Document not found' },
      })
    );
    await controller(req, res);
    expect(remove).to.have.been.calledOnceWithExactly('GAR-1', 'DOCUMENT-1');
    expect(lookup).not.to.have.been.called;
    expectUploadStopped('deletefailed');
  });

  it('redirects to deletion failure for a decoded error message', async () => {
    req.body.deleteDocId = 'DOCUMENT-1';
    remove.resolves({ message: 'Document not found' });
    await controller(req, res);
    expectUploadStopped('deletefailed');
  });

  it('stops before scanning when the document lookup rejects', async () => {
    lookup.rejects(new Error('Connection unavailable'));
    await controller(req, res);
    expect(lookup).to.have.been.calledOnceWithExactly('GAR-1');
    expectUploadStopped('e');
  });

  it('stops before scanning when the document lookup returns an HTTP error envelope', async () => {
    lookup.resolves({ statusCode: 503, body: { message: 'Unavailable' } });
    await controller(req, res);
    expectUploadStopped('e');
  });

  it('enforces the total size limit using decoded existing documents', async () => {
    req.file.size = 1000000;
    lookup.resolves({
      items: [
        { fileName: 'FILE1.pdf', size: '5.9MB' },
        { fileName: 'FILE2.pdf', size: '2MB' },
      ],
    });
    await controller(req, res);
    expectUploadStopped('limit');
  });

  it('rejects a ninth document when eight documents already exist', async () => {
    lookup.resolves({ items: Array.from({ length: 8 }, () => ({ fileName: 'FILE.pdf', size: '1KB' })) });
    await controller(req, res);
    expectUploadStopped('number');
  });

  it('scans and uploads an eighth document against the verified GAR', async () => {
    lookup.resolves({ items: Array.from({ length: 7 }, () => ({ fileName: 'FILE.pdf', size: '1KB' })) });
    await controller(req, res);
    expect(lookup).to.have.been.calledOnceWithExactly('GAR-1');
    expect(remove).not.to.have.been.called;
    expect(scan).to.have.been.calledOnceWithExactly(req.file);
    expect(upload).to.have.been.calledOnceWithExactly('GAR-1', req.file);
    expect(scan).to.have.been.calledBefore(upload);
    expect(res.redirect).to.have.been.calledOnceWithExactly('/garfile/supportingdocuments');
  });

  it('rejects an unrecognised file type before scanning', async () => {
    req.file.buffer.fill(0);
    await controller(req, res);
    expectUploadStopped('invalid');
  });

  it('does not upload when scanning fails', async () => {
    scan.rejects(new Error('Scanner unavailable'));
    await controller(req, res);
    expect(scan).to.have.been.calledOnceWithExactly(req.file);
    expect(upload).not.to.have.been.called;
    expect(res.redirect).to.have.been.calledOnceWithExactly('/garfile/supportingdocuments?query=e');
  });

  it('does not upload a file rejected by the scanner', async () => {
    scan.resolves(false);
    await controller(req, res);
    expect(upload).not.to.have.been.called;
    expect(res.redirect).to.have.been.calledOnceWithExactly('/garfile/supportingdocuments?query=v');
  });

  it('redirects to upload failure when the file-upload service rejects', async () => {
    upload.rejects(new Error('Upload unavailable'));
    await controller(req, res);
    expect(upload).to.have.been.calledOnceWithExactly('GAR-1', req.file);
    expect(res.redirect).to.have.been.calledOnceWithExactly('/garfile/supportingdocuments?query=e');
  });

  it('stores a decoded error message from the file-upload service', async () => {
    upload.resolves({ message: 'GAR not found' });
    await controller(req, res);
    expect(req.session.errMsg).to.deep.equal({ message: 'GAR not found' });
    expect(res.redirect).to.have.been.calledOnceWithExactly('/garfile/supportingdocuments?query=e');
  });

  it('preserves the backend message when an HTTP upload request is rejected', async () => {
    upload.rejects(
      Object.assign(new Error('Bad Request'), {
        type: 'http_error',
        status: 400,
        body: { message: 'GAR not found' },
      })
    );
    await controller(req, res);
    expect(req.session.errMsg).to.deep.equal({ message: 'GAR not found' });
    expect(res.redirect).to.have.been.calledOnceWithExactly('/garfile/supportingdocuments?query=e');
  });

  it('accepts a successful upload with no response body', async () => {
    upload.resolves(null);
    await controller(req, res);
    expect(res.redirect).to.have.been.calledOnceWithExactly('/garfile/supportingdocuments');
  });
});
