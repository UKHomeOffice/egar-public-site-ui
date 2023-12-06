/* eslint-disable no-undef */
/* eslint-disable no-unused-expressions */

const sinon = require('sinon');
const { expect } = require('chai');
const chai = require('chai');
const sinonChai = require('sinon-chai');

require('../global.test');
const CookieModel = require('../../common/models/Cookie.class');
const orgApi = require('../../common/services/organisationApi');

const controller = require('../../app/organisation/get.controller');

describe('Organisation Get Controller', () => {
  let req; let res; let orgApiStub;

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
        }
      },
    };

    res = {
      render: sinon.spy(),
    };

    orgApiStub = sinon.stub(orgApi, 'getUsers');
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
      expect(orgApiStub).to.have.been.calledOnceWithExactly('ORG-ID-1');
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
    };

    beforeEach(() => {
      cookie = new CookieModel(req);
      cookie.setOrganisationUsers(apiResponse);

      orgApiStub.resolves(JSON.stringify(apiResponse));
    });

    it('should display error message if set', () => {
      req.session.errMsg = { message: 'Example error message' };

      const callController = async () => {
        await controller(req, res);
      };

      callController().then(() => {
        expect(req.session.errMsg).to.be.undefined;
        expect(orgApiStub).to.have.been.calledOnceWithExactly('ORG-ID-1');
        expect(res.render).to.have.been.calledOnceWithExactly('app/organisation/index', {
          cookie,
          orgUsers: [
            { id: 'USER-1', firstName: 'Jessica', role: { name: "Admin" }, isEditable: false },
            { id: 'USER-2', firstName: 'Trish', role: { name: "Manager" }, isEditable: false },
          ],
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
        expect(orgApiStub).to.have.been.calledOnceWithExactly('ORG-ID-1');
        expect(res.render).to.have.been.calledOnceWithExactly('app/organisation/index', {
          cookie,
          orgUsers: [
            { id: 'USER-1', firstName: 'Jessica', role: { name: "Admin" }, isEditable: false },
            { id: 'USER-2', firstName: 'Trish', role: { name: "Manager" }, isEditable: false },
          ],
          successHeader: 'Successful header',
          successMsg: 'Example success message',
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
        expect(orgApiStub).to.have.been.calledOnceWithExactly('ORG-ID-1');
        expect(res.render).to.have.been.calledOnceWithExactly('app/organisation/index', {
          cookie,
          orgUsers: [
            { id: 'USER-1', firstName: 'Jessica', role: { name: "Admin" }, isEditable: false },
            { id: 'USER-2', firstName: 'Trish', role: { name: "Manager" }, isEditable: false },
          ],
        });
      });
    });
  });
});
