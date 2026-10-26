const sinon = require('sinon');
const chai = require('chai');

chai.use(require('sinon-chai'));
const { expect } = chai;

require('../../global.test');
const CookieModel = require('../../../common/models/Cookie.class');
const garApi = require('../../../common/services/data-access/garApi');
const dataAccessApi = require('../../../common/services/dataAccessApi');
const controller = require('../../../app/garfile/craft/get.controller');

describe('GAR Craft Get Controller', () => {
  let req;
  let res;
  let cookie;
  let garStub;
  let individualStub;
  let organisationStub;

  beforeEach(() => {
    req = {
      session: {
        gar: { id: 'gar-1' },
        u: { dbId: 'user-1' },
        org: { i: 'organisation-1' },
      },
      query: { page: '2' },
      headers: { referer: 'garfile/craft' },
    };
    res = { render: sinon.spy(), locals: { gar: { garId: 'gar-1' } } };
    cookie = new CookieModel(req);
    garStub = sinon.stub(garApi, 'get').resolves(JSON.stringify({}));
    individualStub = sinon.stub(dataAccessApi.craftApi, 'getCrafts');
    organisationStub = sinon.stub(dataAccessApi.craftApi, 'getOrgCrafts');
  });

  afterEach(() => sinon.restore());

  it('renders a GAR error without requesting saved aircraft when the GAR request rejects', async () => {
    garStub.rejects(new Error('GAR unavailable'));

    await controller(req, res);

    expect(garStub).to.have.been.calledOnceWithExactly('gar-1');
    expect(individualStub).not.to.have.been.called;
    expect(organisationStub).not.to.have.been.called;
    expect(res.render).to.have.been.calledOnceWithExactly('app/garfile/craft/index', {
      cookie,
      errors: [{ message: 'There was a problem getting GAR information' }],
    });
  });

  [
    ['individuals', 'Individual'],
    ['organisations', 'Admin'],
  ].forEach(([description, role]) => {
    describe(description, () => {
      let craftStub;
      let unusedStub;
      let ownerId;

      beforeEach(() => {
        req.session.u.rl = role;
        craftStub = role === 'Individual' ? individualStub : organisationStub;
        unusedStub = role === 'Individual' ? organisationStub : individualStub;
        ownerId = role === 'Individual' ? 'user-1' : 'organisation-1';
      });

      it('renders without pagination when no saved aircraft are returned', async () => {
        craftStub.resolves({ items: [] });

        await controller(req, res);

        expect(craftStub).to.have.been.calledOnceWithExactly(ownerId, 2);
        expect(unusedStub).not.to.have.been.called;
        expect(cookie.getGarCraft()).to.be.undefined;
        expect(cookie.getSavedCraft()).to.deep.equal([]);
        expect(res.render).to.have.been.calledOnceWithExactly('app/garfile/craft/index', { cookie });
      });

      it('leaves the current craft unchanged when returning from the craft page', async () => {
        garStub.resolves(JSON.stringify({ registration: null }));
        craftStub.resolves({ items: [] });

        await controller(req, res);

        expect(cookie.getGarCraft()).to.be.undefined;
        expect(res.render).to.have.been.calledOnceWithExactly('app/garfile/craft/index', { cookie });
      });

      it('populates the current craft and stores the saved-aircraft object with pagination', async () => {
        const currentCraft = { registration: 'G-ABCD', craftType: 'Hondajet', craftBase: 'EGLL' };
        const savedCrafts = {
          items: [currentCraft, { registration: 'G-EFGH', craftType: 'Gulfstream', craftBase: 'OXF' }],
          _meta: { totalPages: 3, totalItems: 12 },
        };
        req.headers.referer = 'garfile/anythingelse';
        req.session.gar.craft = {};
        garStub.resolves(JSON.stringify(currentCraft));
        craftStub.resolves(savedCrafts);

        await controller(req, res);

        expect(cookie.getGarCraft()).to.deep.equal({
          ...currentCraft,
          craftBasePort: 'EGLL',
          portChoice: 'Yes',
        });
        expect(cookie.getSavedCraft()).to.equal(savedCrafts);
        expect(craftStub).to.have.been.calledOnceWithExactly(ownerId, 2);
        expect(unusedStub).not.to.have.been.called;
        expect(res.render).to.have.been.calledOnceWithExactly('app/garfile/craft/index', {
          cookie,
          pages: savedCrafts._meta,
        });
      });

      it('defaults to page one when no page is supplied', async () => {
        delete req.query.page;
        craftStub.resolves({ items: [] });

        await controller(req, res);

        expect(craftStub).to.have.been.calledOnceWithExactly(ownerId, 1);
      });

      ['http_error', 'network_error', 'timeout_error'].forEach((type) => {
        it(`renders an aircraft error on a ${type} without replacing saved aircraft`, async () => {
          const previousCrafts = { items: [{ registration: 'G-OLD' }] };
          cookie.setSavedCraft(previousCrafts);
          craftStub.rejects(
            Object.assign(new Error('Request failed'), { type, status: 503, body: { message: 'Unavailable' } })
          );

          await controller(req, res);

          expect(craftStub).to.have.been.calledOnceWithExactly(ownerId, 2);
          expect(unusedStub).not.to.have.been.called;
          expect(cookie.getSavedCraft()).to.equal(previousCrafts);
          expect(res.render).to.have.been.calledOnceWithExactly('app/garfile/craft/index', {
            cookie,
            errors: [{ message: 'There was a problem getting aircraft information' }],
          });
        });
      });
    });
  });
});
