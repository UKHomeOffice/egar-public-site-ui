const sinon = require('sinon');
const { expect } = require('chai');
const chai = require('chai');
const sinonChai = require('sinon-chai');
const proxyquire = require('proxyquire');
const CookieModel = require('../../../common/models/Cookie.class');

const { garApi } = require('../../../common/services/dataAccessApi');

require('../../global.test');
const { hasGarOwnership } = require('../../../common/utils/garOwnership');

let middleware, garApiStub;
let mockGarResponse = {
  garId: '123',
  carrierCode: 'BA',
  organisationId: 'org1',
  userId: 'user1',
};

describe('middleware/garOwnership', () => {
  let res, req, next, cookieInstance, ownerShipStub, cookieMock;

  beforeEach(() => {
    chai.use(sinonChai);

    req = {
      body: {},
      query: {},
      session: {
        u: {
          dbId: 'user1',
          orgId: 'org1',
        },
      },
    };

    res = {
      redirect: sinon.spy(),
      locals: {},
    };
    next = sinon.spy();

    ownerShipStub = sinon.stub();

    cookieInstance = {
      getGarId: sinon.stub(),
      setGarId: sinon.spy(),
      clearGar: sinon.spy(),
      getUserDbId: sinon.stub().returns('123'),
    };

    cookieMock = sinon.stub().returns(cookieInstance);
    middleware = proxyquire('../../../common/middleware/garOwnership', {
      '../models/Cookie.class': cookieMock,
      '../utils/garOwnership': {
        hasGarOwnership: ownerShipStub,
      },
    });

    garApiStub = sinon.stub(garApi, 'get');
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should call next when ownership is valid', async () => {
    ownerShipStub.resolves({ ok: true, gar: { garId: '123' } });
    req.body.garId = '123';

    await middleware(req, res, next);

    expect(cookieInstance.setGarId).to.have.been.calledWith('123');
    expect(res.locals.gar).to.deep.equal({ garId: '123' });
    expect(next).to.have.been.called;
  });

  it('should redirect and clear cookie when ownership is invalid', async () => {
    req.body.garId = 'wrong-user';

    ownerShipStub.resolves({ ok: false, gar: null });

    await middleware(req, res, next);

    expect(cookieInstance.clearGar).to.have.been.called;
    expect(res.redirect).to.have.been.calledWith('/home');
  });

  it("A user's access is revoked if they don't own a Gar", async () => {
    req.body.garId = 'gar123';
    req.session.org = {
      i: 'differentOrg',
      name: 'otherOrg',
    };

    const cookie = new CookieModel(req);
    cookie.setUserDbId('wrong-user');

    garApiStub.resolves(mockGarResponse);
    ownerShipStub.resolves({ ok: false, gar: null });

    const resp = await hasGarOwnership(cookie, 'gar123');
    expect(resp.ok).to.equal(false);
  });

  it("A user's access is revoked if they do not belong to the same organisation as GAR", async () => {
    req.body.garId = 'gar123';
    req.session.org = {
      i: 'differentOrg',
      name: 'otherOrg',
    };

    const cookie = new CookieModel(req);

    garApiStub.resolves(mockGarResponse);
    ownerShipStub.resolves({ ok: false, gar: null });

    const resp = await hasGarOwnership(cookie, 'gar123');
    expect(resp.ok).to.equal(false);
  });

  it("A user's access is granted if they belong to same org as GAR", async () => {
    req.body.garId = '123';
    const cookie = new CookieModel(req);
    cookie.setOrganisationId('org1');

    garApiStub.resolves(mockGarResponse);
    ownerShipStub.resolves({ ok: false, gar: null });

    const resp = await hasGarOwnership(cookie, '123');
    expect(resp.ok).to.equal(true);
  });

  it('A user belonging to a different org is redirected to /home when access is revoked', async () => {
    req.body.garId = '123';
    req.session.u.orgId = 'differentOrg';

    ownerShipStub.resolves({ ok: false, gar: null });
    garApiStub.resolves(mockGarResponse);

    await middleware(req, res, next);

    expect(res.redirect).to.have.been.calledWith('/home');
    expect(next).to.not.have.been.called;
  });

  it('A user belonging to same org but not owner of GAR (userId not matching) is granted access', async () => {
    req.body.garId = '123';
    // different user but same organisation.
    req.session.u.dbId = 'differentUser';
    req.session.org = {
      i: 'org1',
    };

    ownerShipStub.resolves({ ok: true, gar: mockGarResponse });
    garApiStub.resolves(mockGarResponse);

    await middleware(req, res, next);

    expect(res.redirect).to.not.have.been.called;
    expect(next).to.be.called;
  });

  it('An individual user cannot view Gar not belonging to them', async () => {
    req.body.garId = '123';
    // different user but same organisation.
    req.session.u.dbId = 'individualUser';
    req.session.org = { id: null };

    ownerShipStub.resolves({ ok: false, gar: null });
    garApiStub.resolves(mockGarResponse);

    await middleware(req, res, next);

    expect(res.redirect).to.have.been.calledWith('/home');
    expect(next).to.not.have.been.called;
  });
});
