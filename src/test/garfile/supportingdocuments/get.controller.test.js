const sinon = require('sinon');
const chai = require('chai');
chai.use(require('sinon-chai'));
const { expect } = chai;

require('../../global.test');
const CookieModel = require('../../../common/models/Cookie.class');
const { garApi } = require('../../../common/services/dataAccessApi');
const controller = require('../../../app/garfile/supportingdocuments/get.controller');

describe('GAR Supporting Documents Get Controller', () => {
  let req;
  let res;
  let lookup;
  let documents;

  beforeEach(() => {
    req = { session: { gar: { id: 'session-gar' } }, query: {} };
    res = { render: sinon.spy(), locals: { gar: { garId: '90210' } } };
    documents = {
      items: [
        { supportingDocumentId: '1', fileName: 'filename_1.docx', size: '9000' },
        { supportingDocumentId: '2', fileName: 'filename_2.xlsx', size: '15000' },
      ],
    };
    lookup = sinon.stub(garApi, 'getSupportingDocs').resolves(documents);
  });

  afterEach(() => sinon.restore());

  function expectRender(context) {
    expect(lookup).to.have.been.calledOnceWithExactly('90210');
    expect(res.render).to.have.been.calledOnceWithExactly('app/garfile/supportingdocuments/index', {
      cookie: new CookieModel(req),
      max_num_files: 8,
      ...context,
    });
  }

  it('renders decoded documents without an error', async () => {
    await controller(req, res);
    expectRender({ supportingDoc: documents });
  });

  it('renders an error when the lookup rejects', async () => {
    lookup.rejects(new Error('Connection unavailable'));
    await controller(req, res);
    expectRender({ errors: [{ message: 'There was a problem getting GAR supporting documents information' }] });
  });

  it('renders an HTTP read-envelope message instead of treating it as documents', async () => {
    lookup.resolves({ statusCode: 400, body: { message: 'GAR not found' } });
    await controller(req, res);
    expectRender({ errors: [{ message: 'GAR not found' }] });
  });

  it('renders a generic error for an HTTP read envelope without a message', async () => {
    lookup.resolves({ statusCode: 503, body: 'Unavailable' });
    await controller(req, res);
    expectRender({ errors: [{ message: 'There was a problem getting GAR supporting documents information' }] });
  });

  it('renders a decoded API message instead of documents', async () => {
    lookup.resolves({ message: 'GAR not found' });
    await controller(req, res);
    expectRender({ errors: [{ message: 'GAR not found' }] });
  });

  it('consumes the stored upload error once', async () => {
    req.query.query = 'e';
    const error = { identifier: 'file', message: 'File not uploaded. Try again' };
    req.session.errMsg = error;
    await controller(req, res);
    expect(req.session.errMsg).to.be.undefined;
    expectRender({ supportingDoc: documents, errors: [error] });
  });

  [
    ['v', { message: 'File cannot be uploaded. The file has a virus', identifier: 'file' }],
    ['0', { identifier: 'file', message: 'No file selected for upload' }],
    ['limit', { message: 'The total file size of all uploaded documents must be less than 7.5MB', identifier: 'file' }],
    ['number', { message: '8 is the maximum number of documents that can be uploaded', identifier: 'file' }],
    ['deletefailed', { message: 'Failed to delete document. Try again' }],
    ['invalid', { message: 'Invalid file type selected', identifier: 'file' }],
    ['unauthorized', { message: 'You are not authorized to manage supporting documents for this GAR' }],
  ].forEach(([query, error]) => {
    it(`renders the ${query} upload outcome with the document list`, async () => {
      req.query.query = query;
      await controller(req, res);
      expectRender({ supportingDoc: documents, errors: [error] });
    });
  });
});
