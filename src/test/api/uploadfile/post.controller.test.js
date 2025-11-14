/* eslint-disable no-undef */

const sinon = require('sinon');
const { expect } = require('chai');
const chai = require('chai');
const sinonChai = require('sinon-chai');

require('../../global.test');
const garApi = require('../../../common/services/garApi');
const clamAVService = require('../../../common/services/clamAVService');
const fileUploadApi = require('../../../common/services/fileUploadApi');

const controller = require('../../../app/api/uploadfile/post.controller');

describe('API upload file post controller', () => {
  let req;
  let res;
  let garApiGetDocsStub;
  let garApiDeleteDocsStub;
  let clamAVServiceStub;
  let fileUploadApiStub;

  beforeEach(() => {
    chai.use(sinonChai);

    req = {
      file: {
        originalname: 'test-gar.pdf',
        buffer: Buffer.alloc(10000),
        size: 10000,
      },
      body: { garid: 'GAR-1', user: 'Example User Field' },
      session: {
        u: {
          dbId: 'khan@augmented.com',
        },
        save: (callback) => callback(),
      },
    };
    res = {
      redirect: sinon.stub(),
      render: sinon.stub(),
    };

    garApiGetDocsStub = sinon.stub(garApi, 'getSupportingDocs');
    garApiDeleteDocsStub = sinon.stub(garApi, 'deleteGarSupportingDoc');
    clamAVServiceStub = sinon.stub(clamAVService, 'scanFile');
    fileUploadApiStub = sinon.stub(fileUploadApi, 'postFile');
  });

  afterEach(() => {
    sinon.restore();
  });

  it('return redirect if there no file sent', async () => {
    delete req.file;

    await controller(req, res);

    expect(garApiGetDocsStub).to.not.have.been.called;
    expect(garApiDeleteDocsStub).to.not.have.been.called;
    expect(clamAVServiceStub).to.not.have.been.called;
    expect(fileUploadApiStub).to.not.have.been.called;
    expect(res.redirect).to.have.been.calledOnceWithExactly('/garfile/supportingdocuments?query=0');
  });

  describe('delete file request', () => {
    it('should return error message if api rejects', () => {
      req.body.deleteDocId = 'DOCUMENT-1';

      garApiDeleteDocsStub.rejects('garApi.deleteGarSupportingDoc Example Reject');

      const callController = async () => {
        await controller(req, res);
      };

      callController().then(() => {
        expect(garApiGetDocsStub).to.not.have.been.called;
        expect(garApiDeleteDocsStub).to.have.been.calledOnceWithExactly('GAR-1', 'DOCUMENT-1');
        expect(clamAVServiceStub).to.not.have.been.called;
        expect(fileUploadApiStub).to.not.have.been.called;
        expect(res.redirect).to.have.been.calledOnceWithExactly('/garfile/supportingdocuments?query=deletefailed');
      });
    });

    it('should return error message if api returns a message', () => {
      req.body.deleteDocId = 'DOCUMENT-1';

      garApiDeleteDocsStub.resolves(
        JSON.stringify({
          message: 'Document not found',
        })
      );

      const callController = async () => {
        await controller(req, res);
      };

      callController().then(() => {
        expect(garApiGetDocsStub).to.not.have.been.called;
        expect(garApiDeleteDocsStub).to.have.been.calledOnceWithExactly('GAR-1', 'DOCUMENT-1');
        expect(clamAVServiceStub).to.not.have.been.called;
        expect(fileUploadApiStub).to.not.have.been.called;
        expect(res.redirect).to.have.been.calledOnceWithExactly('/garfile/supportingdocuments?query=deletefailed');
      });
    });

    it('should redirect if deleted ok', () => {
      req.body.deleteDocId = 'DOCUMENT-1';

      garApiDeleteDocsStub.resolves(JSON.stringify({}));

      const callController = async () => {
        await controller(req, res);
      };

      callController().then(() => {
        expect(garApiGetDocsStub).to.not.have.been.called;
        expect(garApiDeleteDocsStub).to.have.been.calledOnceWithExactly('GAR-1', 'DOCUMENT-1');
        expect(clamAVServiceStub).to.not.have.been.called;
        expect(fileUploadApiStub).to.not.have.been.called;
        expect(res.redirect).to.have.been.calledOnceWithExactly('/garfile/supportingdocuments');
      });
    });
  });

  describe('exceed file limit failures', () => {
    it('should redirect with error if api rejects', () => {
      garApiGetDocsStub.rejects('garApi.getSupportingDocs Example Reject');

      const callController = async () => {
        await controller(req, res);
      };

      callController()
        .then()
        .then()
        .then(() => {
          expect(garApiGetDocsStub).to.have.been.calledOnceWithExactly('GAR-1');
          expect(garApiDeleteDocsStub).to.not.have.been.called;
          expect(clamAVServiceStub).to.not.have.been.called;
          expect(fileUploadApiStub).to.not.have.been.called;
          expect(res.redirect).to.have.been.calledOnceWithExactly('/garfile/supportingdocuments?query=e');
        });
    });

    it('should redirect with limit parameter if function returns true', () => {
      req.file.size = 1000000;

      garApiGetDocsStub.resolves(
        JSON.stringify({
          items: [
            { fileName: 'FILE1.doc', size: '5.9MB' },
            { fileName: 'FILE2.doc', size: '2MB' },
          ],
        })
      );

      const callController = async () => {
        await controller(req, res);
      };

      callController().then(() => {
        expect(garApiGetDocsStub).to.have.been.calledOnceWithExactly('GAR-1');
        expect(garApiDeleteDocsStub).to.not.have.been.called;
        expect(clamAVServiceStub).to.not.have.been.called;
        expect(fileUploadApiStub).to.not.have.been.called;
        expect(res.redirect).to.have.been.calledOnceWithExactly('/garfile/supportingdocuments?query=limit');
      });
    });

    it('should redirect with number parameter if number of files more than 10', () => {
      req.file.size = 1000000;

      garApiGetDocsStub.resolves(
        JSON.stringify({
          items: [
            { fileName: 'FILE1.doc', size: '1KB' },
            { fileName: 'FILE2.doc', size: '1KB' },
            { fileName: 'FILE3.doc', size: '1KB' },
            { fileName: 'FILE4.doc', size: '1KB' },
            { fileName: 'FILE5.doc', size: '1KB' },
            { fileName: 'FILE6.doc', size: '1KB' },
            { fileName: 'FILE7.doc', size: '1KB' },
            { fileName: 'FILE8.doc', size: '1KB' },
            { fileName: 'FILE9.doc', size: '1KB' },
            { fileName: 'FILE10.doc', size: '1KB' },
            { fileName: 'FILE11.doc', size: '1KB' },
          ],
        })
      );

      const callController = async () => {
        await controller(req, res);
      };

      callController().then(() => {
        expect(garApiGetDocsStub).to.have.been.calledOnceWithExactly('GAR-1');
        expect(garApiDeleteDocsStub).to.not.have.been.called;
        expect(clamAVServiceStub).to.not.have.been.called;
        expect(fileUploadApiStub).to.not.have.been.called;
        expect(res.redirect).to.have.been.calledOnceWithExactly('/garfile/supportingdocuments?query=number');
      });
    });
  });

  describe('valid files less than max number', () => {
    it('should redirect without any parameter when number of files less than the max number', () => {
      // Create form data for ClamAV
      formData = {
        name: req.file.originalname,
        file: {
          value: req.file.buffer, // Upload the  file in the multi-part post
          options: {
            filename: req.file.originalname,
          },
        },
      };

      // Set the first four bytes of the buffer to convince fileType library it is a PDF
      req.file.buffer.writeUInt8(0x25, 0);
      req.file.buffer.writeUInt8(0x50, 1);
      req.file.buffer.writeUInt8(0x44, 2);
      req.file.buffer.writeUInt8(0x46, 3);

      garApiGetDocsStub.resolves(
        JSON.stringify({
          items: [
            { fileName: 'FILE1.doc', size: '1K' },
            { fileName: 'FILE1.doc', size: '1K' },
            { fileName: 'FILE1.doc', size: '1K' },
            { fileName: 'FILE1.doc', size: '1K' },
            { fileName: 'FILE1.doc', size: '1K' },
            { fileName: 'FILE1.doc', size: '1K' },
            { fileName: 'FILE1.doc', size: '1K' },
          ],
        })
      );
      clamAVServiceStub.resolves(true);
      fileUploadApiStub.resolves(JSON.stringify({}));

      const callController = async () => {
        await controller(req, res);
      };

      callController()
        .then()
        .then()
        .then(() => {
          expect(garApiGetDocsStub).to.have.been.calledOnceWithExactly('GAR-1');
          expect(garApiDeleteDocsStub).to.not.have.been.called;
          expect(clamAVServiceStub).to.have.been.calledOnceWithExactly(formData);
          expect(fileUploadApiStub).to.have.been.calledOnceWithExactly('GAR-1', {
            originalname: 'test-gar.pdf',
            buffer: req.file.buffer,
            size: 10000,
          });
          expect(res.redirect).to.have.been.calledOnceWithExactly('/garfile/supportingdocuments');
        });
    });
  });

  it('should redirect with invalid parameter for unexpected file types', () => {
    garApiGetDocsStub.resolves(
      JSON.stringify({
        items: [{ fileName: 'FILE1.doc', size: '2MB' }],
      })
    );

    const callController = async () => {
      await controller(req, res);
    };

    callController().then(() => {
      expect(garApiGetDocsStub).to.have.been.calledOnceWithExactly('GAR-1');
      expect(garApiDeleteDocsStub).to.not.have.been.called;
      expect(clamAVServiceStub).to.not.have.been.called;
      expect(fileUploadApiStub).to.not.have.been.called;
      expect(res.redirect).to.have.been.calledOnceWithExactly('/garfile/supportingdocuments?query=invalid');
    });
  });

  describe('valid file, av service failures', () => {
    let formData;

    beforeEach(() => {
      // Create form data for ClamAV
      formData = {
        name: req.file.originalname,
        file: {
          value: req.file.buffer, // Upload the  file in the multi-part post
          options: {
            filename: req.file.originalname,
          },
        },
      };

      // Set the first four bytes of the buffer to convince fileType library it is a PDF
      req.file.buffer.writeUInt8(0x25, 0);
      req.file.buffer.writeUInt8(0x50, 1);
      req.file.buffer.writeUInt8(0x44, 2);
      req.file.buffer.writeUInt8(0x46, 3);

      // To allow the exceedFileLimit function to return false
      garApiGetDocsStub.resolves(
        JSON.stringify({
          items: [{ fileName: 'FILE1.doc', size: '2MB' }],
        })
      );
    });

    it('should redirect with error if av service rejects', () => {
      clamAVServiceStub.rejects('clamAVService.scanFile Example Reject');

      const callController = async () => {
        await controller(req, res);
      };

      callController()
        .then()
        .then()
        .then(() => {
          expect(garApiGetDocsStub).to.have.been.calledOnceWithExactly('GAR-1');
          expect(garApiDeleteDocsStub).to.not.have.been.called;
          expect(clamAVServiceStub).to.have.been.calledOnceWithExactly(formData);
          expect(fileUploadApiStub).to.not.have.been.called;
          expect(res.redirect).to.have.been.calledOnceWithExactly('/garfile/supportingdocuments?query=e');
        });
    });

    it('should redirect with virus error if av service returns false', () => {
      clamAVServiceStub.resolves(false);

      const callController = async () => {
        await controller(req, res);
      };

      callController()
        .then()
        .then()
        .then(() => {
          expect(garApiGetDocsStub).to.have.been.calledOnceWithExactly('GAR-1');
          expect(garApiDeleteDocsStub).to.not.have.been.called;
          expect(clamAVServiceStub).to.have.been.calledOnceWithExactly(formData);
          expect(fileUploadApiStub).to.not.have.been.called;
          expect(res.redirect).to.have.been.calledOnceWithExactly('/garfile/supportingdocuments?query=v');
        });
    });
  });

  describe('valid file, av service ok', () => {
    let formData;

    beforeEach(() => {
      // Create form data for ClamAV
      formData = {
        name: req.file.originalname,
        file: {
          value: req.file.buffer, // Upload the  file in the multi-part post
          options: {
            filename: req.file.originalname,
          },
        },
      };

      // Set the first four bytes of the buffer to convince fileType library it is a PDF
      req.file.buffer.writeUInt8(0x25, 0);
      req.file.buffer.writeUInt8(0x50, 1);
      req.file.buffer.writeUInt8(0x44, 2);
      req.file.buffer.writeUInt8(0x46, 3);

      // To allow the exceedFileLimit function to return false
      garApiGetDocsStub.resolves(
        JSON.stringify({
          items: [{ fileName: 'FILE1.doc', size: '2MB' }],
        })
      );

      clamAVServiceStub.resolves(true);
    });

    it('should redirect if api rejects', () => {
      fileUploadApiStub.rejects('fileUploadApi.postFile Example Reject');

      const callController = async () => {
        await controller(req, res);
      };

      callController()
        .then()
        .then()
        .then()
        .then(() => {
          expect(garApiGetDocsStub).to.have.been.calledOnceWithExactly('GAR-1');
          expect(garApiDeleteDocsStub).to.not.have.been.called;
          expect(clamAVServiceStub).to.have.been.calledOnceWithExactly(formData);
          expect(fileUploadApiStub).to.have.been.calledOnceWithExactly('GAR-1', {
            originalname: 'test-gar.pdf',
            buffer: req.file.buffer,
            size: 10000,
          });
          expect(res.redirect).to.have.been.calledOnceWithExactly('/garfile/supportingdocuments');
        });
    });

    it('should redirect with error parameter if api returns message', () => {
      fileUploadApiStub.resolves(
        JSON.stringify({
          message: 'GAR not found',
        })
      );

      const callController = async () => {
        await controller(req, res);
      };

      callController()
        .then()
        .then()
        .then(() => {
          expect(garApiGetDocsStub).to.have.been.calledOnceWithExactly('GAR-1');
          expect(garApiDeleteDocsStub).to.not.have.been.called;
          expect(clamAVServiceStub).to.have.been.calledOnceWithExactly(formData);
          expect(fileUploadApiStub).to.have.been.calledOnceWithExactly('GAR-1', {
            originalname: 'test-gar.pdf',
            buffer: req.file.buffer,
            size: 10000,
          });
          expect(res.redirect).to.have.been.calledOnceWithExactly('/garfile/supportingdocuments?query=e');
        });
    });

    it('should redirect if successful', () => {
      fileUploadApiStub.resolves(JSON.stringify({}));

      const callController = async () => {
        await controller(req, res);
      };

      callController()
        .then()
        .then()
        .then(() => {
          expect(garApiGetDocsStub).to.have.been.calledOnceWithExactly('GAR-1');
          expect(garApiDeleteDocsStub).to.not.have.been.called;
          expect(clamAVServiceStub).to.have.been.calledOnceWithExactly(formData);
          expect(fileUploadApiStub).to.have.been.calledOnceWithExactly('GAR-1', {
            originalname: 'test-gar.pdf',
            buffer: req.file.buffer,
            size: 10000,
          });
          expect(res.redirect).to.have.been.calledOnceWithExactly('/garfile/supportingdocuments');
        });
    });
  });
  //
});
