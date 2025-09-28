/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */

import sinon from 'sinon';

import { expect } from 'chai';
import chai from 'chai';
import sinonChai from 'sinon-chai';
import '../../global.test.js';
import CookieModel from '../../../common/models/Cookie.class.js';
import garApi from '../../../common/services/garApi.js';
import craftApi from '../../../common/services/craftApi.js';
import pagination from '../../../common/utils/pagination.js';
import controller from '../../../app/garfile/craft/get.controller.js';

describe('GAR Craft Get Controller', () => {
  let req; let res; let garApiGetStub;
  let paginationBuildStub; let paginationGetCurrentPageStub;

  beforeEach(() => {
    chai.use(sinonChai);

    req = {
      session: {
        gar: {
          id: 'RANDOM-GAR-ID',
        },
      },
    };
    res = {
      render: sinon.spy(),
    };

    garApiGetStub = sinon.stub(garApi, 'get');
    paginationBuildStub = sinon.stub(pagination, 'build');
    paginationGetCurrentPageStub = sinon.stub(pagination, 'getCurrentPage');
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should return an error if api rejects', async () => {
    cookie = new CookieModel(req);
    garApiGetStub.rejects('garApi.get Example Reject');

    const callController = async () => {
      await controller(req, res);
    };

    callController().then(() => {
      expect(garApiGetStub).to.have.been.calledWith('RANDOM-GAR-ID');
      expect(res.render).to.have.been.calledWith('app/garfile/craft/index', { cookie, errors: [{ message: 'There was a problem getting GAR information' }] });
    });
  });

  describe('individuals', () => {
    let craftApiGetCraftsStub;

    beforeEach(() => {
      req.session.u = { dbId: 'USER1-ID', rl: 'Individual' };
      craftApiGetCraftsStub = sinon.stub(craftApi, 'getCrafts');
    });

    it('should return an error if craft api rejects', () => {
      // Add referrer to prevent setting current craft
      req.headers = { referer: 'garfile/craft' };
      cookie = new CookieModel(req);
      garApiGetStub.resolves(JSON.stringify({}));
      craftApiGetCraftsStub.rejects('craftApi.getCrafts Example Reject');

      const callController = async () => {
        await controller(req, res);
      };

      callController().then().then(() => {
        expect(garApiGetStub).to.have.been.calledWith('RANDOM-GAR-ID');
        expect(craftApiGetCraftsStub).to.have.been.calledWith('USER1-ID');
        expect(res.render).to.have.been.calledWith('app/garfile/craft/index', { cookie, errors: [{ message: 'There was a problem getting aircraft information' }] });
      });
    });

    it('should not set any crafts', () => {
      // Add referrer to prevent setting current craft
      req.headers = { referer: 'garfile/craft' };
      cookie = new CookieModel(req);
      garApiGetStub.resolves(JSON.stringify({}));
      craftApiGetCraftsStub.resolves(JSON.stringify({ items: [] }));

      const callController = async () => {
        await controller(req, res);
      };

      callController().then(() => {
        expect(cookie.getGarCraft()).to.be.undefined;
        expect(cookie.getSavedCraft()).to.eql([]);
        expect(garApiGetStub).to.have.been.calledWith('RANDOM-GAR-ID');
        expect(craftApiGetCraftsStub).to.have.been.calledWith('USER1-ID');
        expect(res.render).to.have.been.calledWith('app/garfile/craft/index', { cookie });
      });
    });

    it('should not set any crafts if registration is null', () => {
      // Add referrer to prevent setting current craft
      req.headers = { referer: 'garfile/craft' };
      cookie = new CookieModel(req);
      garApiGetStub.resolves(JSON.stringify({ registration: null }));
      craftApiGetCraftsStub.resolves(JSON.stringify({ items: [] }));

      const callController = async () => {
        await controller(req, res);
      };

      callController().then(() => {
        expect(cookie.getGarCraft()).to.be.undefined;
        expect(cookie.getSavedCraft()).to.eql([]);
        expect(garApiGetStub).to.have.been.calledWith('RANDOM-GAR-ID');
        expect(craftApiGetCraftsStub).to.have.been.calledWith('USER1-ID');
        expect(res.render).to.have.been.calledWith('app/garfile/craft/index', { cookie });
      });
    });

    it('should populate current and saved craft', () => {
      const currentCraft = { registration: 'Z-AFTC', craftType: 'Hondajet', craftBase: 'EGLL' };
      const savedCraft = [
        currentCraft, { registration: 'G-ABCD', craftType: 'Gulfstream', craftBase: 'OXF' },
      ];
      req.headers = { referer: 'garfile/anythingelse' };
      req.session.gar.craft = {};
      cookie = new CookieModel(req);
      cookie.setGarCraft(currentCraft.registration, currentCraft.craftType, currentCraft.craftBase);
      cookie.setSavedCraft(savedCraft);
      garApiGetStub.resolves(JSON.stringify(currentCraft));
      craftApiGetCraftsStub.resolves(JSON.stringify({
        items: savedCraft,
        _meta: { totalPages: 1, totalItems: 1 },
      }));
      paginationGetCurrentPageStub.returns(1);
      paginationBuildStub.returns({ startItem: 1, endItem: 1 });

      const callController = async () => {
        await controller(req, res);
      };

      callController().then(() => {
        expect(cookie.getGarCraft()).to.eql({
          registration: 'Z-AFTC', craftType: 'Hondajet', craftBase: 'EGLL', craftBasePort: 'EGLL', portChoice: "Yes"
        });
        expect(cookie.getSavedCraft()).to.eql({
          items: [
            { registration: 'Z-AFTC', craftType: 'Hondajet', craftBase: 'EGLL' },
            { registration: 'G-ABCD', craftType: 'Gulfstream', craftBase: 'OXF' },
          ],
          _meta: { totalPages: 1, totalItems: 1 },
        });
        expect(garApiGetStub).to.have.been.calledWith('RANDOM-GAR-ID');
        expect(craftApiGetCraftsStub).to.have.been.calledWith('USER1-ID');
        expect(res.render).to.have.been.calledWith('app/garfile/craft/index', { cookie, pages: { startItem: 1, endItem: 1 } });
      });
    });
  });

  describe('organisations', () => {
    let craftApiGetOrgCraftsStub;

    beforeEach(() => {
      req.session.u = { dbId: 'USER1-ID', rl: 'Admin' };
      req.session.org = { i: 'ORG1-ID' };
      craftApiGetOrgCraftsStub = sinon.stub(craftApi, 'getOrgCrafts');
    });

    it('should return an error if craft api rejects', () => {
      // Add referrer to prevent setting current craft
      req.headers = { referer: 'garfile/craft' };
      cookie = new CookieModel(req);
      garApiGetStub.resolves(JSON.stringify({}));
      craftApiGetOrgCraftsStub.rejects('craftApi.getOrgCrafts Example Reject');

      const callController = async () => {
        await controller(req, res);
      };

      callController().then().then(() => {
        expect(garApiGetStub).to.have.been.calledWith('RANDOM-GAR-ID');
        expect(craftApiGetOrgCraftsStub).to.have.been.calledWith('ORG1-ID');
        expect(res.render).to.have.been.calledWith('app/garfile/craft/index', { cookie, errors: [{ message: 'There was a problem getting aircraft information' }] });
      });
    });

    it('should not set any crafts', () => {
      // Add referrer to prevent setting current craft
      req.headers = { referer: 'garfile/craft' };
      cookie = new CookieModel(req);
      garApiGetStub.resolves(JSON.stringify({}));
      craftApiGetOrgCraftsStub.resolves(JSON.stringify({ items: [] }));

      const callController = async () => {
        await controller(req, res);
      };

      callController().then(() => {
        expect(cookie.getGarCraft()).to.be.undefined;
        expect(cookie.getSavedCraft()).to.eql([]);
        expect(garApiGetStub).to.have.been.calledWith('RANDOM-GAR-ID');
        expect(craftApiGetOrgCraftsStub).to.have.been.calledWith('ORG1-ID');
        expect(res.render).to.have.been.calledWith('app/garfile/craft/index', { cookie });
      });
    });

    it('should not set any crafts if registration is null', () => {
      // Add referrer to prevent setting current craft
      req.headers = { referer: 'garfile/craft' };
      cookie = new CookieModel(req);
      garApiGetStub.resolves(JSON.stringify({ registration: null }));
      craftApiGetOrgCraftsStub.resolves(JSON.stringify({ items: [] }));

      const callController = async () => {
        await controller(req, res);
      };

      callController().then(() => {
        expect(cookie.getGarCraft()).to.be.undefined;
        expect(cookie.getSavedCraft()).to.eql([]);
        expect(garApiGetStub).to.have.been.calledWith('RANDOM-GAR-ID');
        expect(craftApiGetOrgCraftsStub).to.have.been.calledWith('ORG1-ID');
        expect(res.render).to.have.been.calledWith('app/garfile/craft/index', { cookie });
      });
    });

    it('should populate current and saved craft', () => {
      const currentCraft = { registration: 'Z-AFTC', craftType: 'Hondajet', craftBase: 'EGLL' };
      const savedCraft = [
        currentCraft, { registration: 'G-ABCD', craftType: 'Gulfstream', craftBase: 'OXF' },
      ];
      req.headers = { referer: 'garfile/anythingelse' };
      req.session.gar.craft = {};
      cookie = new CookieModel(req);
      cookie.setGarCraft(currentCraft.registration, currentCraft.craftType, currentCraft.craftBase, 'Yes');
      cookie.setSavedCraft(savedCraft);
      garApiGetStub.resolves(JSON.stringify(currentCraft));
      craftApiGetOrgCraftsStub.resolves(JSON.stringify({
        items: savedCraft,
        _meta: { totalPages: 1, totalItems: 1 },
      }));
      paginationGetCurrentPageStub.returns(1);
      paginationBuildStub.returns({ startItem: 1, endItem: 1 });

      const callController = async () => {
        await controller(req, res);
      };

      callController().then(() => {
        expect(cookie.getGarCraft()).to.eql({
          registration: 'Z-AFTC', craftType: 'Hondajet', craftBase: 'EGLL', craftBasePort: "EGLL", portChoice: "Yes"
        });
        expect(cookie.getSavedCraft()).to.eql({
          items: [
            { registration: 'Z-AFTC', craftType: 'Hondajet', craftBase: 'EGLL' },
            { registration: 'G-ABCD', craftType: 'Gulfstream', craftBase: 'OXF' },
          ],
          _meta: { totalPages: 1, totalItems: 1 },
        });
        expect(garApiGetStub).to.have.been.calledWith('RANDOM-GAR-ID');
        expect(craftApiGetOrgCraftsStub).to.have.been.calledWith('ORG1-ID');
        expect(res.render).to.have.been.calledWith('app/garfile/craft/index', { cookie, pages: { startItem: 1, endItem: 1 } });
      });
    });
  });
});
