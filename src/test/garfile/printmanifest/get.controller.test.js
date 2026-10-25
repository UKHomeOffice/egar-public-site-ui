const sinon = require('sinon');
const { expect } = require('chai');
const chai = require('chai');
const sinonChai = require('sinon-chai');
const proxyquire = require('proxyquire');

require('../../global.test');

const manifestFields = require('../../../common/seeddata/gar_manifest_fields.json');

describe('GAR Print Manifest Get Controller', () => {
  let req, res, cookieInstance, garApiStub, controller;

  const flush = () => new Promise((resolve) => setImmediate(resolve));
  const buildGar = (statusName) => ({
    garId: 'gar-1',
    userId: 'user-1',
    organisationId: 'org-1',
    status: { name: statusName },
  });

  beforeEach(() => {
    chai.use(sinonChai);

    req = { session: {} };
    res = { render: sinon.spy() };

    cookieInstance = {
      getGarId: sinon.stub().returns('gar-1'),
      setGarStatus: sinon.spy(),
    };
    garApiStub = {
      get: sinon.stub(),
      getPeople: sinon.stub().resolves(JSON.stringify({ items: [{ id: 'pesron-1' }] })),
      getSupportingDocs: sinon.stub().resolves(JSON.stringify({ items: [{ id: 'document-1' }] })),
    };

    controller = proxyquire('../../../app/garfile/printmanifest/get.controller', {
      '../../../common/models/Cookie.class': sinon.stub().returns(cookieInstance),
      '../../../common/services/data-access/garApi': garApiStub,
    });
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should render the manifest with change links for a draft GAR and strip owner ids', async () => {
    garApiStub.get.resolves(JSON.stringify(buildGar('Draft')));

    controller(req, res);
    await flush();

    expect(garApiStub.get).to.have.been.calledWith('gar-1', true);
    expect(garApiStub.getPeople).to.have.been.calledWith('gar-1');
    expect(garApiStub.getSupportingDocs).to.have.been.calledWith('gar-1');
    expect(cookieInstance.setGarStatus).to.have.been.calledWith('Draft');
    expect(res.render).to.have.been.calledOnceWith('app/garfile/printmanifest/index', {
      cookie: cookieInstance,
      manifestFields,
      garfile: { garId: 'gar-1', status: { name: 'Draft' } },
      garpeople: { items: [{ id: 'pesron-1' }] },
      garsupportingdocs: { items: [{ id: 'document-1' }] },
      showChangeLinks: true,
    });
  });

  ['Submitted', 'Cancelled'].forEach((status) => {
    it(`should hide change links for a ${status} GAR`, async () => {
      garApiStub.get.resolves(JSON.stringify(buildGar(status)));

      controller(req, res);
      await flush();

      expect(res.render.firstCall.args[1].showChangeLinks).to.be.false;
    });
  });

  it('should render an error when the GAR cannot be retrieved', async () => {
    garApiStub.get.rejects(new Error('error'));

    controller(req, res);
    await flush();

    expect(res.render).to.have.been.calledOnceWith('app/garfile/printmanifest/index', {
      cookie: cookieInstance,
      manifestFields,
      garfile: {},
      garpeople: {},
      garsupportingdocs: {},
      errors: [{ message: 'Failed to get GAR information' }],
    });
  });

  it('should render an error when the response is not valid JSON', async () => {
    garApiStub.get.resolves('not json');

    controller(req, res);
    await flush();

    expect(res.render.firstCall.args[1].errors).to.deep.eq([{ message: 'Failed to get GAR information' }]);
  });
});
