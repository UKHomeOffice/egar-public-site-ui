/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */

const sinon = require('sinon');
const { expect } = require('chai');
const chai = require('chai');
const sinonChai = require('sinon-chai');
const proxyquire = require('proxyquire');

const CookieModel = require('../../common/models/Cookie.class');
const craftApi = require('../../common/services/craftApi');

describe('Aircraft Get Controller', () => {
  let res; let individualCraftStub; let organisationCraftStub;
  let controller;
  let paginationStub;

  const apiResponse = JSON.stringify({
    items: [{ id: 1, name: 'Craft 1' }, { id: 2, name: 'Craft 2' }],
    _meta: { totalPages: 1, totalItems: 2 },
  });

  beforeEach(() => {
    chai.use(sinonChai);

    res = {
      render: sinon.spy(),
    };
    individualCraftStub = sinon.stub(craftApi, 'getCrafts');
    organisationCraftStub = sinon.stub(craftApi, 'getOrgCrafts');
    paginationStub = sinon.stub();

    // In order to stub out the pagination module
    controller = proxyquire('../../app/aircraft/get.controller', {
      './pagination': paginationStub,
    });
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('individuals', () => {
    let cookie;
    const req = {
      query: { page: 1 },
      session: {
        u: {
          dbId: 'example@somewhere.com',
          rl: 'Individual',
        },
      },
    };

    beforeEach(() => {
      cookie = new CookieModel(req);
      paginationStub.returns({ startItem: 1, endItem: 1 });
    });

    it('should return an error message when craft api rejects', async () => {
      individualCraftStub.rejects('craftApi.getCrafts Example Reject');

      const callController = async () => {
        await controller(req, res);
      };

      callController().then(() => {
        expect(individualCraftStub).to.have.been.called;
        expect(organisationCraftStub).to.not.have.been.called;
        expect(res.render).to.have.been.calledWith('app/aircraft/index');
        res.render('app/aircraft/index', { cookie, errors: [{ message: 'There was a problem fetching data' }] });
      });
    });

    it('should return error messages if in the session', async () => {
      req.session.errMsg = 'Example Error Message';
      individualCraftStub.resolves(apiResponse);
      await controller(req, res);

      expect(req.session.errMsg).to.be.undefined;
      expect(res.render).to.have.been.calledWith('app/aircraft/index', {
        cookie,
        savedCrafts: {
          items: [{ id: 1, name: 'Craft 1' }, { id: 2, name: 'Craft 2' }],
          _meta: { totalPages: 1, totalItems: 2 },
        },
        pages: { startItem: 1, endItem: 1 },
        errors: ['Example Error Message'],
      });
    });

    it('should return success messages if in the session', async () => {
      req.session.successMsg = 'Example Success Message';
      req.session.successHeader = 'Example Success Header';
      individualCraftStub.resolves(apiResponse);
      await controller(req, res);

      expect(req.session.errMsg).to.be.undefined;
      expect(req.session.successMsg).to.be.undefined;
      expect(req.session.successHeader).to.be.undefined;
      expect(res.render).to.have.been.calledWith('app/aircraft/index', {
        cookie,
        savedCrafts: {
          items: [{ id: 1, name: 'Craft 1' }, { id: 2, name: 'Craft 2' }],
          _meta: { totalPages: 1, totalItems: 2 },
        },
        pages: { startItem: 1, endItem: 1 },
        successMsg: 'Example Success Message',
        successHeader: 'Example Success Header',
      });
    });

    it('should just go to the page if no messages', async () => {
      individualCraftStub.resolves(apiResponse);
      await controller(req, res);

      expect(req.session.errMsg).to.be.undefined;
      expect(req.session.successMsg).to.be.undefined;
      expect(req.session.successHeader).to.be.undefined;
      expect(res.render).to.have.been.calledWith('app/aircraft/index', {
        cookie,
        savedCrafts: {
          items: [{ id: 1, name: 'Craft 1' }, { id: 2, name: 'Craft 2' }],
          _meta: { totalPages: 1, totalItems: 2 },
        },
        pages: { startItem: 1, endItem: 1 },
      });
    });
  });

  describe('organisations', () => {
    const req = {
      query: { page: 1 },
      session: {
        u: {
          dbId: 'example@somewhere.com',
          rl: 'Admin',
        },
      },
    };

    it('should return an error message when craft api rejects', async () => {
      const cookie = new CookieModel(req);
      organisationCraftStub.rejects('craftApi.getOrgCrafts Example Reject');

      const callController = async () => {
        await controller(req, res);
      };

      callController().then(() => {
        expect(individualCraftStub).to.not.have.been.called;
        expect(organisationCraftStub).to.have.been.called;
        expect(res.render).to.have.been.calledWith('app/aircraft/index');
        res.render('app/aircraft/index', { cookie, errors: [{ message: 'There was a problem fetching data' }] });
      });
    });

    it('should just go to the page if no messages', async () => {
      const cookie = new CookieModel(req);
      organisationCraftStub.resolves(apiResponse);
      paginationStub.returns({ startItem: 1, endItem: 2 });
      await controller(req, res);

      expect(req.session.errMsg).to.be.undefined;
      expect(req.session.successMsg).to.be.undefined;
      expect(req.session.successHeader).to.be.undefined;
      expect(res.render).to.have.been.calledWith('app/aircraft/index', {
        cookie,
        savedCrafts: {
          items: [{ id: 1, name: 'Craft 1' }, { id: 2, name: 'Craft 2' }],
          _meta: { totalPages: 1, totalItems: 2 },
        },
        pages: { startItem: 1, endItem: 2 },
      });
    });
  });
});
