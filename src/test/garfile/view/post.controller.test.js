/* eslint-disable no-unused-expressions */
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
      session: {
        u: {
          dbId: 'USER-123',
        },
      },
    };
    res = {
      redirect: sinon.spy(),
      render: sinon.spy(),
    };

    garApiGetStub = sinon.stub(garApi, 'get');
    garApiGetPeopleStub = sinon.stub(garApi, 'getPeople');
    garApiGetSupportingDocsStub = sinon.stub(garApi, 'getSupportingDocs');
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('checkGARUser', () => {
    it('should return false if all undefined fields', () => {
      expect(controller.checkGARUser(undefined, undefined, undefined)).to.be.false;
    });

    it('should return false if all null fields', () => {
      expect(controller.checkGARUser(null, null, null)).to.be.false;
    });

    it('should return false if user id no match and undefined organisation', () => {
      const parsedGar = {
        userId: 'USER-123',
      };

      expect(controller.checkGARUser(parsedGar, undefined, 'USER-234')).to.be.false;
    });

    it('should return false if organisation id no match and undefined user', () => {
      const parsedGar = {
        userId: 'USER-123',
        organisationId: 'ORG-123',
      };

      expect(controller.checkGARUser(parsedGar, undefined, 'ORG-234')).to.be.false;
    });

    it('should return false if no match', () => {
      const parsedGar = {
        userId: 'USER-123',
        organisationId: 'ORG-123',
      };

      expect(controller.checkGARUser(parsedGar, 'USER-234', 'ORG-234')).to.be.false;
    });

    it('should return true if user ids match', () => {
      const parsedGar = {
        userId: 'USER-123',
      };

      expect(controller.checkGARUser(parsedGar, 'USER-123', undefined)).to.be.true;
    });

    it('should return true if organisation ids match', () => {
      const parsedGar = {
        organisationId: 'ORG-123',
      };

      expect(controller.checkGARUser(parsedGar, 'USER-123', 'ORG-123')).to.be.true;
    });

    it('should return true if organisation ids match and user ids match', () => {
      const parsedGar = {
        organisationId: 'ORG-123',
        userId: 'USER-123',
      };

      expect(controller.checkGARUser(parsedGar, 'USER-123', 'ORG-123')).to.be.true;
    });
  });

  it('should redirect to home if the api does not find the GAR', () => {
    const cookie = new CookieModel(req);
    cookie.setGarId('GAR-ID-EXAMPLE-1');

    garApiGetStub.resolves(JSON.stringify({ message: 'GAR does not exist' }));
    garApiGetPeopleStub.resolves(JSON.stringify({ message: 'GAR does not exist' }));
    garApiGetSupportingDocsStub.resolves(JSON.stringify({ message: 'GAR does not exist' }));

    const callController = async () => {
      await controller(req, res);
    };

    callController().then().then(() => {
      expect(garApiGetStub).to.have.been.calledOnceWithExactly('GAR-ID-EXAMPLE-1');
      expect(garApiGetPeopleStub).to.have.been.calledOnceWithExactly('GAR-ID-EXAMPLE-1');
      expect(garApiGetSupportingDocsStub).to.have.been.calledOnceWithExactly('GAR-ID-EXAMPLE-1');
      expect(res.redirect).to.have.been.calledOnceWithExactly('/home');
      expect(res.render).to.not.have.been.called;
    });
  });

  it('should render with an error if one of the api calls rejects', () => {
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
      // expect(res.redirect).to.have.been.calledOnceWithExactly('/home');
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
      garId: 'GAR-ID-EXAMPLE-2-API', status: { name: 'Draft' }, userId: 'USER-123',
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
      garId: 'GAR-ID-EXAMPLE-1-API', status: { name: 'Draft' }, userId: 'USER-123',
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
      garId: 'GAR-ID-EXAMPLE-1-API', status: { name: 'Cancelled' }, userId: 'USER-123',
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

  it('should redirect if user id does not match', () => {
    const cookie = new CookieModel(req);
    cookie.setGarId('GAR-ID-EXAMPLE-1');

    garApiGetStub.resolves(JSON.stringify({
      garId: 'GAR-ID-EXAMPLE-1-API', status: { name: 'Submitted' }, userId: 'USER-124',
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
      expect(res.redirect).to.have.been.calledOnceWithExactly('/home');
      expect(res.render).to.not.have.been.called;
    });
  });

  it('should render submitted page if Submitted, matching org ids', () => {
    req.session.org = { i: 'ORG-123' };
    const cookie = new CookieModel(req);
    cookie.setGarId('GAR-ID-EXAMPLE-1');

    garApiGetStub.resolves(JSON.stringify({
      garId: 'GAR-ID-EXAMPLE-1-API', status: { name: 'Submitted' }, userId: 'USER-124', organisationId: 'ORG-123',
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
        garfile: {
          garId: 'GAR-ID-EXAMPLE-1-API', status: { name: 'Submitted' },
        },
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
      garId: 'GAR-ID-EXAMPLE-1-API', status: { name: 'Submitted' }, userId: 'USER-123',
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
