/* eslint-disable no-undef */

const sinon = require('sinon');
const { expect } = require('chai');
const chai = require('chai');
const sinonChai = require('sinon-chai');

require('../../global.test');
const CookieModel = require('../../../common/models/Cookie.class');
const manifestFields = require('../../../common/seeddata/gar_manifest_fields.json');
const garApi = require('../../../common/services/garApi');

const controller = require('../../../app/garfile/view/post.controller');

describe('GAR view post controller', () => {
  let req; let res;
  let garApiGetStub; let garApiGetPeopleStub; let garApiGetSupportingDocsStub;

  beforeEach(() => {
    chai.use(sinonChai);

    req = {
      body: { garId: 'GAR-ID-EXAMPLE-1' },
      session: {},
    };
    res = {
      render: sinon.spy(),
    };

    garApiGetStub = sinon.stub(garApi, 'get');
    garApiGetPeopleStub = sinon.stub(garApi, 'getPeople');
    garApiGetSupportingDocsStub = sinon.stub(garApi, 'getSupportingDocs');
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should render with errors if one of the api calls rejects', () => {
    const cookie = new CookieModel(req);
    cookie.setGarId('GAR-ID-EXAMPLE-1');

    garApiGetStub.resolves();
    garApiGetPeopleStub.resolves();
    garApiGetSupportingDocsStub.rejects('garApi.getSupportingDocs Example Reject');

    const callController = async () => {
      await controller(req, res);
    };

    callController().then().then(() => {
      expect(garApiGetStub).to.have.been.calledOnceWithExactly('GAR-ID-EXAMPLE-1');
      expect(garApiGetPeopleStub).to.have.been.calledOnceWithExactly('GAR-ID-EXAMPLE-1');
      expect(garApiGetSupportingDocsStub).to.have.been.calledOnceWithExactly('GAR-ID-EXAMPLE-1');
      expect(res.render).to.have.been.calledOnceWithExactly('app/garfile/view/index', {
        cookie,
        manifestFields,
        garfile: {},
        garpeople: {},
        supportingdocs: {},
        errors: [{ message: 'Failed to get GAR information' }],
      });
    });
  });

  it('should use the session cookie gar id if not in the body', () => {
    const cookie = new CookieModel(req);
    delete req.body.garId;
    req.session.gar = { id: 'GAR-ID-EXAMPLE-2' };
    garApiGetStub.resolves(JSON.stringify({
      garId: 'GAR-ID-EXAMPLE-2-API', status: { name: 'Draft' },
    }));
    garApiGetPeopleStub.resolves(JSON.stringify({
      items: [
        { id: 'PERSON-1', firstName: 'Simona' },
        { id: 'PERSON-2', firstName: 'Serena' },
      ],
    }));
    garApiGetSupportingDocsStub.resolves(JSON.stringify({
      items: [
        { name: 'EXAMPLE-DOC-1', size: '1MB' },
      ],
    }));

    const callController = async () => {
      await controller(req, res);
    };

    callController().then().then(() => {
      expect(garApiGetStub).to.have.been.calledOnceWithExactly('GAR-ID-EXAMPLE-2');
      expect(garApiGetPeopleStub).to.have.been.calledOnceWithExactly('GAR-ID-EXAMPLE-2');
      expect(garApiGetSupportingDocsStub).to.have.been.calledOnceWithExactly('GAR-ID-EXAMPLE-2');
      expect(res.render).to.have.been.calledOnceWithExactly('app/garfile/view/index', {
        cookie,
        manifestFields,
        garfile: { garId: 'GAR-ID-EXAMPLE-2-API', status: { name: 'Draft' } },
        garpeople: {
          items: [
            { id: 'PERSON-1', firstName: 'Simona' },
            { id: 'PERSON-2', firstName: 'Serena' },
          ],
        },
        supportingdocs: {
          items: [
            { name: 'EXAMPLE-DOC-1', size: '1MB' },
          ],
        },
        showChangeLinks: true,
      });
    });
  });

  it('should render page if Draft', () => {
    const cookie = new CookieModel(req);
    cookie.setGarId('GAR-ID-EXAMPLE-1');

    garApiGetStub.resolves(JSON.stringify({
      garId: 'GAR-ID-EXAMPLE-1-API', status: { name: 'Draft' },
    }));
    garApiGetPeopleStub.resolves(JSON.stringify({
      items: [
        { id: 'PERSON-1', firstName: 'Simona' },
        { id: 'PERSON-2', firstName: 'Serena' },
      ],
    }));
    garApiGetSupportingDocsStub.resolves(JSON.stringify({
      items: [
        { name: 'EXAMPLE-DOC-1', size: '1MB' },
      ],
    }));

    const callController = async () => {
      await controller(req, res);
    };

    callController().then().then(() => {
      expect(garApiGetStub).to.have.been.calledOnceWithExactly('GAR-ID-EXAMPLE-1');
      expect(garApiGetPeopleStub).to.have.been.calledOnceWithExactly('GAR-ID-EXAMPLE-1');
      expect(garApiGetSupportingDocsStub).to.have.been.calledOnceWithExactly('GAR-ID-EXAMPLE-1');
      expect(res.render).to.have.been.calledOnceWithExactly('app/garfile/view/index', {
        cookie,
        manifestFields,
        garfile: { garId: 'GAR-ID-EXAMPLE-1-API', status: { name: 'Draft' } },
        garpeople: {
          items: [
            { id: 'PERSON-1', firstName: 'Simona' },
            { id: 'PERSON-2', firstName: 'Serena' },
          ],
        },
        supportingdocs: {
          items: [
            { name: 'EXAMPLE-DOC-1', size: '1MB' },
          ],
        },
        showChangeLinks: true,
      });
    });
  });

  it('should render submitted page if Cancelled', () => {
    const cookie = new CookieModel(req);
    cookie.setGarId('GAR-ID-EXAMPLE-1');

    garApiGetStub.resolves(JSON.stringify({
      garId: 'GAR-ID-EXAMPLE-1-API', status: { name: 'Cancelled' },
    }));
    garApiGetPeopleStub.resolves(JSON.stringify({
      items: [
        { id: 'PERSON-1', firstName: 'Simona' },
        { id: 'PERSON-2', firstName: 'Serena' },
      ],
    }));
    garApiGetSupportingDocsStub.resolves(JSON.stringify({
      items: [
        { name: 'EXAMPLE-DOC-1', size: '1MB' },
      ],
    }));

    const callController = async () => {
      await controller(req, res);
    };

    callController().then().then(() => {
      expect(garApiGetStub).to.have.been.calledOnceWithExactly('GAR-ID-EXAMPLE-1');
      expect(garApiGetPeopleStub).to.have.been.calledOnceWithExactly('GAR-ID-EXAMPLE-1');
      expect(garApiGetSupportingDocsStub).to.have.been.calledOnceWithExactly('GAR-ID-EXAMPLE-1');
      expect(res.render).to.have.been.calledOnceWithExactly('app/garfile/view/index', {
        cookie,
        manifestFields,
        showChangeLinks: false,
        garfile: { garId: 'GAR-ID-EXAMPLE-1-API', status: { name: 'Cancelled' } },
        garpeople: {
          items: [
            { id: 'PERSON-1', firstName: 'Simona' },
            { id: 'PERSON-2', firstName: 'Serena' },
          ],
        },
        supportingdocs: {
          items: [
            { name: 'EXAMPLE-DOC-1', size: '1MB' },
          ],
        },
      });
    });
  });

  it('should render submitted page if Submitted', () => {
    const cookie = new CookieModel(req);
    cookie.setGarId('GAR-ID-EXAMPLE-1');

    garApiGetStub.resolves(JSON.stringify({
      garId: 'GAR-ID-EXAMPLE-1-API', status: { name: 'Submitted' },
    }));
    garApiGetPeopleStub.resolves(JSON.stringify({
      items: [
        { id: 'PERSON-1', firstName: 'Simona' },
        { id: 'PERSON-2', firstName: 'Serena' },
      ],
    }));
    garApiGetSupportingDocsStub.resolves(JSON.stringify({
      items: [
        { name: 'EXAMPLE-DOC-1', size: '1MB' },
      ],
    }));

    const callController = async () => {
      await controller(req, res);
    };

    callController().then().then(() => {
      expect(garApiGetStub).to.have.been.calledOnceWithExactly('GAR-ID-EXAMPLE-1');
      expect(garApiGetPeopleStub).to.have.been.calledOnceWithExactly('GAR-ID-EXAMPLE-1');
      expect(garApiGetSupportingDocsStub).to.have.been.calledOnceWithExactly('GAR-ID-EXAMPLE-1');
      expect(res.render).to.have.been.calledOnceWithExactly('app/garfile/view/index', {
        cookie,
        manifestFields,
        showChangeLinks: false,
        garfile: { garId: 'GAR-ID-EXAMPLE-1-API', status: { name: 'Submitted' } },
        garpeople: {
          items: [
            { id: 'PERSON-1', firstName: 'Simona' },
            { id: 'PERSON-2', firstName: 'Serena' },
          ],
        },
        supportingdocs: {
          items: [
            { name: 'EXAMPLE-DOC-1', size: '1MB' },
          ],
        },
      });
    });
  });
});
