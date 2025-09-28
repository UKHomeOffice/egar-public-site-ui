/* eslint-disable no-undef */
/* eslint-disable no-unused-expressions */

import sinon from 'sinon';

import { expect } from 'chai';
import chai from 'chai';
import sinonChai from 'sinon-chai';
import '../global.test.js';
import CookieModel from '../../common/models/Cookie.class.js';
import orgApi from '../../common/services/organisationApi.js';
import pagination from '../../common/utils/pagination.js';
import settings from '../../common/config/index.js';
const configMock = {
  ...settings,
  ONE_LOGIN_SHOW_ONE_LOGIN: false
};
import controller from '../../app/organisation/get.controller.js';

describe('Organisation Get Controller', () => {
  let req; let res; let orgApiStub;
  let paginationBuildStub; let paginationGetCurrentPageStub;

  beforeEach(() => {
    chai.use(sinonChai);

    req = {
      body: {},
      session: {
        org: {
          i: 'ORG-ID-1'
        },
        u: {
          rl: "User"
        },
      },
    };

    res = {
      render: sinon.spy(),
    };

    orgApiStub = sinon.stub(orgApi, 'getUsers');
    paginationBuildStub = sinon.stub(pagination, 'build');
    paginationGetCurrentPageStub = sinon.stub(pagination, 'getCurrentPage');
    
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should redirect with errors if api rejects', () => {
    const cookie = new CookieModel(req);
    orgApiStub.rejects('orgApi.getUsers Example Reject');
    

    const callController = async () => {
      await controller(req, res);
    };

    callController().then(() => {
      expect(orgApiStub).to.have.been.calledOnceWithExactly('ORG-ID-1', undefined);
      expect(res.render).to.have.been.calledOnceWithExactly('app/organisation/index', {
        cookie,
        errors: [{ message: 'There was a problem fetching organisation users' }],
      });
    });
  });

  describe('api returns ok', () => {
    let cookie;

    const apiResponse = {
      items: [
        { id: 'USER-1', firstName: 'Jessica', role: { name: "Admin" } },
        { id: 'USER-2', firstName: 'Trish', role: { name: "Manager" }  },
      ],
     _meta: { totalPages: 1, totalItems: 2 },
    };

    beforeEach(() => {
      cookie = new CookieModel(req);
      cookie.setOrganisationUsers(apiResponse);

      orgApiStub.resolves(JSON.stringify(apiResponse));
      paginationBuildStub.returns({ startItem: 1, endItem: 1 });
      paginationGetCurrentPageStub.returns(1);
    });

    it('should display error message if set', () => {
      req.session.errMsg = { message: 'Example error message' };

      const callController = async () => {
        await controller(req, res);
      };

      callController().then(() => {
        expect(req.session.errMsg).to.be.undefined;
        expect(orgApiStub).to.have.been.calledOnceWithExactly('ORG-ID-1', 1);
        expect(res.render).to.have.been.calledOnceWithExactly('app/organisation/index', {
          cookie,
          orgUsers: [
            { id: 'USER-1', firstName: 'Jessica', role: { name: "Admin" }, isEditable: false },
            { id: 'USER-2', firstName: 'Trish', role: { name: "Manager" }, isEditable: false },
          ],
          pages: { startItem: 1, endItem: 1 },
          currentPage: 1,
          errors: [{ message: 'Example error message' }],  
        });
      });
    });
     
    it('should display success message if set', () => {
      req.session.successHeader = 'Successful header';
      req.session.successMsg = 'Example success message';

      const callController = async () => {
        await controller(req, res);
      };

      callController().then(() => {
        expect(req.session.errMsg).to.be.undefined;
        expect(req.session.successHeader).to.be.undefined;
        expect(req.session.successMsg).to.be.undefined;
        expect(orgApiStub).to.have.been.calledOnceWithExactly('ORG-ID-1', 1);
        expect(res.render).to.have.been.calledOnceWithExactly('app/organisation/index', {
          cookie,
          orgUsers: [
            { id: 'USER-1', firstName: 'Jessica', role: { name: "Admin" }, isEditable: false },
            { id: 'USER-2', firstName: 'Trish', role: { name: "Manager" }, isEditable: false },
          ],
          successHeader: 'Successful header',
          successMsg: 'Example success message',
          pages: { startItem: 1, endItem: 1 },
          currentPage: 1
        });
      });
    });

    it('should redirect with no messages if no parameters', () => {
      const callController = async () => {
        await controller(req, res);
      };

      callController().then(() => {
        expect(req.session.errMsg).to.be.undefined;
        expect(req.session.successHeader).to.be.undefined;
        expect(req.session.successMsg).to.be.undefined;
        expect(orgApiStub).to.have.been.calledOnceWithExactly('ORG-ID-1', 1);
        expect(res.render).to.have.been.calledOnceWithExactly('app/organisation/index', {
          cookie,
          orgUsers: [
            { id: 'USER-1', firstName: 'Jessica', role: { name: "Admin" }, isEditable: false },
            { id: 'USER-2', firstName: 'Trish', role: { name: "Manager" }, isEditable: false },
          ],
          pages: { startItem: 1, endItem: 1 },
          currentPage: 1
        });
      });
    });
  });
});
