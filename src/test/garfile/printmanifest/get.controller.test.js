const sinon = require('sinon');
const chai = require('chai');

chai.use(require('sinon-chai'));
const { expect } = chai;

require('../../global.test');
const CookieModel = require('../../../common/models/Cookie.class');
const { garApi } = require('../../../common/services/dataAccessApi');
const manifestFields = require('../../../common/seeddata/gar_manifest_fields.json');
const controller = require('../../../app/garfile/printmanifest/get.controller');

describe('GAR Print Manifest Get Controller', () => {
  let req;
  let res;
  let gar;
  let get;
  let getPeople;
  let getDocs;

  beforeEach(() => {
    req = { session: { gar: { id: 'session-gar', status: 'Draft' } } };
    res = { render: sinon.spy(), locals: { gar: { garId: 'gar-1' } } };
    gar = {
      garId: 'gar-1',
      userId: 'user-1',
      organisationId: 'org-1',
      status: { name: 'Draft' },
    };
    get = sinon.stub(garApi, 'get').resolves(gar);
    getPeople = sinon.stub(garApi, 'getPeople').resolves({ items: [{ garPeopleId: 'person-1' }] });
    getDocs = sinon.stub(garApi, 'getSupportingDocs').resolves({ items: [{ supportingDocumentId: 'document-1' }] });
  });

  afterEach(() => sinon.restore());

  function expectRetrievalError() {
    expect(res.render).to.have.been.calledOnceWithExactly('app/garfile/printmanifest/index', {
      cookie: new CookieModel(req),
      manifestFields,
      garfile: {},
      garpeople: {},
      garsupportingdocs: {},
      errors: [{ message: 'Failed to get GAR information' }],
    });
  }

  it('renders decoded draft data using the verified GAR ID without mutating the response', async () => {
    await controller(req, res);

    expect(get).to.have.been.calledOnceWithExactly('gar-1', true);
    expect(getPeople).to.have.been.calledOnceWithExactly('gar-1');
    expect(getDocs).to.have.been.calledOnceWithExactly('gar-1');
    expect(res.render).to.have.been.calledOnceWithExactly('app/garfile/printmanifest/index', {
      cookie: new CookieModel(req),
      manifestFields,
      garfile: { garId: 'gar-1', status: { name: 'Draft' } },
      garpeople: { items: [{ garPeopleId: 'person-1' }] },
      garsupportingdocs: { items: [{ supportingDocumentId: 'document-1' }] },
      showChangeLinks: true,
    });
    expect(gar).to.include({ userId: 'user-1', organisationId: 'org-1' });
  });

  ['Submitted', 'Cancelled'].forEach((status) => {
    it(`hides change links and updates session status for a ${status} GAR`, async () => {
      gar.status.name = status;

      await controller(req, res);

      expect(req.session.gar.status).to.equal(status);
      expect(res.render).to.have.been.calledOnce;
      expect(res.render.firstCall.args[1].showChangeLinks).to.equal(false);
    });
  });

  it('renders the retrieval error when an API request rejects', async () => {
    get.rejects(new Error('Connection unavailable'));

    await controller(req, res);

    expectRetrievalError();
  });

  it('renders the retrieval error instead of a partial manifest on an HTTP read envelope', async () => {
    getDocs.resolves({ statusCode: 503, body: { message: 'Unavailable' } });

    await controller(req, res);

    expectRetrievalError();
  });
});
