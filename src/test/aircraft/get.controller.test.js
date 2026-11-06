const sinon = require('sinon');
const chai = require('chai');

chai.use(require('sinon-chai'));
const { expect } = chai;

require('../global.test');
const CookieModel = require('../../common/models/Cookie.class');
const { craftApi } = require('../../common/services/dataAccessApi');
const controller = require('../../app/aircraft/get.controller');

describe('Saved Aircraft Get Controller', () => {
  let req;
  let res;
  let cookie;
  let individualCraftStub;
  let organisationCraftStub;
  let apiResponse;

  beforeEach(() => {
    req = {
      query: { page: '2' },
      session: {
        u: { dbId: 'user-1' },
        org: { i: 'organisation-1' },
      },
    };
    res = { render: sinon.spy() };
    cookie = new CookieModel(req);
    apiResponse = {
      items: [
        { id: 1, name: 'Craft 1' },
        { id: 2, name: 'Craft 2' },
      ],
      _meta: { totalPages: 2, totalItems: 4 },
    };
    individualCraftStub = sinon.stub(craftApi, 'getCrafts');
    organisationCraftStub = sinon.stub(craftApi, 'getOrgCrafts');
  });

  afterEach(() => sinon.restore());

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
        craftStub = role === 'Individual' ? individualCraftStub : organisationCraftStub;
        unusedStub = role === 'Individual' ? organisationCraftStub : individualCraftStub;
        ownerId = role === 'Individual' ? 'user-1' : 'organisation-1';
        craftStub.resolves(apiResponse);
      });

      it('renders the aircraft object and pagination and saves it in the session', async () => {
        await controller(req, res);

        expect(craftStub).to.have.been.calledOnceWithExactly(ownerId, 2);
        expect(unusedStub).not.to.have.been.called;
        expect(cookie.getSavedCraft()).to.equal(apiResponse);
        expect(res.render).to.have.been.calledOnceWithExactly('app/aircraft/index', {
          cookie,
          savedCrafts: apiResponse,
          pages: apiResponse._meta,
        });
      });

      [undefined, 'invalid'].forEach((page) => {
        it(`defaults to page one when the page is ${page}`, async () => {
          req.query.page = page;

          await controller(req, res);

          expect(craftStub).to.have.been.calledOnceWithExactly(ownerId, 1);
        });
      });

      it('renders and clears an error message from the session', async () => {
        req.session.errMsg = 'Example Error Message';

        await controller(req, res);

        expect(req.session.errMsg).to.be.undefined;
        expect(res.render).to.have.been.calledOnceWithExactly('app/aircraft/index', {
          cookie,
          savedCrafts: apiResponse,
          pages: apiResponse._meta,
          errors: ['Example Error Message'],
        });
      });

      it('renders and clears a success message and header from the session', async () => {
        req.session.successMsg = 'Example Success Message';
        req.session.successHeader = 'Example Success Header';

        await controller(req, res);

        expect(req.session.successMsg).to.be.undefined;
        expect(req.session.successHeader).to.be.undefined;
        expect(res.render).to.have.been.calledOnceWithExactly('app/aircraft/index', {
          cookie,
          savedCrafts: apiResponse,
          pages: apiResponse._meta,
          successMsg: 'Example Success Message',
          successHeader: 'Example Success Header',
        });
      });

      [
        ['validation', { type: 'http_error', status: 400, body: { message: 'Invalid page' } }],
        ['server', { type: 'http_error', status: 503, body: { message: 'Unavailable' } }],
        ['network', { type: 'network_error' }],
        ['timeout', { type: 'timeout_error' }],
      ].forEach(([failure, metadata]) => {
        it(`renders the fetch error message on a ${failure} failure without saving the response`, async () => {
          const previousCrafts = cookie.getSavedCraft();
          craftStub.rejects(Object.assign(new Error('Request failed'), metadata));

          await controller(req, res);

          expect(craftStub).to.have.been.calledOnceWithExactly(ownerId, 2);
          expect(unusedStub).not.to.have.been.called;
          expect(cookie.getSavedCraft()).to.equal(previousCrafts);
          expect(res.render).to.have.been.calledOnceWithExactly('app/aircraft/index', {
            cookie,
            errors: [{ message: 'There was a problem fetching data' }],
          });
        });
      });
    });
  });
});
