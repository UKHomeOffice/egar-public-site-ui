/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */

const sinon = require('sinon');
const { expect } = require('chai');
const chai = require('chai');
const sinonChai = require('sinon-chai');

require('../../global.test');
const CookieModel = require('../../../common/models/Cookie.class');
const garApi = require('../../../common/services/garApi');

const controller = require('../../../app/garfile/supportingdocuments/get.controller');

describe('GAR Supporting Documents Get Controller', () => {
  let req; let res; let apiResponse;

  beforeEach(() => {
    chai.use(sinonChai);

    req = {
      session: {
        gar: { id: '90210' },
      },
    };
    res = {
      render: sinon.spy(),
    };

    apiResponse = {
      items: [
        { supportingDocumentId: '1', fileName: 'filename_1.docx', size: '9000' },
        { supportingDocumentId: '2', fileName: 'filename_2.xlsx', size: '15000' },
      ],
    };
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should render an error message if api rejects', () => {
    const cookie = new CookieModel(req);
    sinon.stub(garApi, 'getSupportingDocs').rejects('garApi.getSupportingDocs Example Reject');

    const callController = async () => {
      await controller(req, res);
    };

    callController().then(() => {
      expect(garApi.getSupportingDocs).to.have.been.calledWith('90210');
      expect(res.render).to.have.been.calledOnceWithExactly('app/garfile/supportingdocuments/index', {
        cookie,
        errors: [{ message: 'There was a problem getting GAR supporting documents information' }],
      });
    });
  });

  it('should render an error message if api returns one', () => {
    const cookie = new CookieModel(req);
    sinon.stub(garApi, 'getSupportingDocs').resolves(JSON.stringify({
      message: 'GAR not found',
    }));

    const callController = async () => {
      await controller(req, res);
    };

    callController().then(() => {
      expect(garApi.getSupportingDocs).to.have.been.calledWith('90210');
      expect(res.render).to.have.been.calledOnceWithExactly('app/garfile/supportingdocuments/index', {
        cookie,
        max_num_files: 8,
        errors: [{ message: 'GAR not found' }],
      });
    });
  });

  it('should return an error if query is set to e', () => {
    req.query = { query: 'e' };
    req.session.errMsg = { 
      identifier: 'file', 
      message: 'File not uploaded. There was an error in scanning the file. Please try again' 
    }
    const cookie = new CookieModel(req);
    sinon.stub(garApi, 'getSupportingDocs').resolves(JSON.stringify(apiResponse));

    const callController = async () => {
      await controller(req, res);
    };

    callController().then(() => {
      expect(garApi.getSupportingDocs).to.have.been.calledWith('90210');
      expect(res.render).to.have.been.calledOnceWithExactly('app/garfile/supportingdocuments/index', {
        cookie,
        supportingDoc: apiResponse,
        errors: [{ 
          identifier: 'file', 
          message: 'File not uploaded. There was an error in scanning the file. Please try again' 
        }],
      });
    });
  });

  it('should return an error if query is set to v', () => {
    req.query = { query: 'v' };
    const cookie = new CookieModel(req);
    sinon.stub(garApi, 'getSupportingDocs').resolves(JSON.stringify(apiResponse));

    const callController = async () => {
      await controller(req, res);
    };

    callController().then(() => {
      expect(garApi.getSupportingDocs).to.have.been.calledWith('90210');
      expect(res.render).to.have.been.calledOnceWithExactly('app/garfile/supportingdocuments/index', {
        cookie,
        supportingDoc: apiResponse,
        errors: [{ message: 'File cannot be uploaded. The file has a virus' }],
      });
    });
  });
  // query = 0
  it('should return an error if query is set to 0', () => {
    req.query = { query: '0' };
    const cookie = new CookieModel(req);
    sinon.stub(garApi, 'getSupportingDocs').resolves(JSON.stringify(apiResponse));

    const callController = async () => {
      await controller(req, res);
    };

    callController().then(() => {
      expect(garApi.getSupportingDocs).to.have.been.calledWith('90210');
      expect(res.render).to.have.been.calledOnceWithExactly('app/garfile/supportingdocuments/index', {
        cookie,
        supportingDoc: apiResponse,
        errors: [{ identifier: 'file', message: 'No file selected for upload' }],
      });
    });
  });

  it('should return an error if query is set to limit', () => {
    req.query = { query: 'limit' };
    const cookie = new CookieModel(req);
    sinon.stub(garApi, 'getSupportingDocs').resolves(JSON.stringify(apiResponse));

    const callController = async () => {
      await controller(req, res);
    };

    callController().then(() => {
      expect(garApi.getSupportingDocs).to.have.been.calledWith('90210');
      expect(res.render).to.have.been.calledOnceWithExactly('app/garfile/supportingdocuments/index', {
        cookie,
        supportingDoc: apiResponse,
        errors: [{ message: 'File size exceeds total limit' }],
      });
    });
  });

  it('should return an error if query is set to deletefailed', () => {
    req.query = { query: 'deletefailed' };
    const cookie = new CookieModel(req);
    sinon.stub(garApi, 'getSupportingDocs').resolves(JSON.stringify(apiResponse));

    const callController = async () => {
      await controller(req, res);
    };

    callController().then(() => {
      expect(garApi.getSupportingDocs).to.have.been.calledWith('90210');
      expect(res.render).to.have.been.calledOnceWithExactly('app/garfile/supportingdocuments/index', {
        cookie,
        supportingDoc: apiResponse,
        errors: [{ message: 'Failed to delete document. Try again' }],
      });
    });
  });

  it('should return an error if query is set to invalid', () => {
    req.query = { query: 'invalid' };
    const cookie = new CookieModel(req);
    sinon.stub(garApi, 'getSupportingDocs').resolves(JSON.stringify(apiResponse));

    const callController = async () => {
      await controller(req, res);
    };

    callController().then(() => {
      expect(garApi.getSupportingDocs).to.have.been.calledWith('90210');
      expect(res.render).to.have.been.calledOnceWithExactly('app/garfile/supportingdocuments/index', {
        cookie,
        supportingDoc: apiResponse,
        errors: [{ message: 'Invalid file type selected' }],
      });
    });
  });

  it('should render the page with no errors if no query parameter set', () => {
    req.query = {};
    const cookie = new CookieModel(req);
    sinon.stub(garApi, 'getSupportingDocs').resolves(JSON.stringify(apiResponse));

    const callController = async () => {
      await controller(req, res);
    };

    callController().then(() => {
      expect(garApi.getSupportingDocs).to.have.been.calledWith('90210');
      expect(res.render).to.have.been.calledOnceWithExactly('app/garfile/supportingdocuments/index', {
        cookie,
        supportingDoc: apiResponse,
      });
    });
  });
});
