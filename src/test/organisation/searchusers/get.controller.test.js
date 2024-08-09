/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */

const sinon = require('sinon');
const { expect } = require('chai');
const chai = require('chai');
const sinonChai = require('sinon-chai');

require('../../global.test');
const CookieModel = require('../../../common/models/Cookie.class');
const orgApii = require('../../../common/services/organisationApi');
const controller = require('../../../app/organisation/searchusers/get.controller');

describe('Organisation Search Users Get Controller', () => {
  let req; let res; let orgApiStub;

  beforeEach(() => {
    chai.use(sinonChai);

    req = {
      body: {},
      session: { org: { i: 'ORGANISATION-ID-1' }, searchUserName: 'TEST'  }
    };

    res = {
      redirect: sinon.spy(),
      render: sinon.spy(),
    };

    orgApiStub = sinon.stub(orgApii, 'getSearchOrgUsers');
  });

  afterEach(() => {
    sinon.restore();
  });

  it('redirects if no searchUserName set', async () => {
    delete req.session.searchUserName;

    await controller(req, res);

    expect(req.session.errMsg).to.be.undefined;
    expect(res.redirect).to.have.been.calledOnceWithExactly('/organisation');
    expect(res.render).to.not.have.been.called;
    expect(orgApiStub).to.not.have.been.called;
  });


  it('should redirect with error message if api rejects', () => {
    orgApiStub.rejects('orgApiStub.getSearchUsers Example Reject');
    const callController = async () => {
      await controller(req, res);
    };

    callController().then(() => {
      expect(orgApiStub).to.have.been.calledOnceWithExactly('ORGANISATION-ID-1', 'TEST');
    });
  });

  describe('api returns ok', () => {
    let cookie;

    const apiResponse = 
      [
        { id: 'PERSON-1', first_name: 'PERSON-1-name', role: { name: 'User' } },
        { id: 'PERSON-4', first_name: 'PERSON-1-name', role: { name: 'User' } },
        { id: 'PERSON-5', first_name: 'PERSON-3-name', role: { name: 'Admin' } },
      ];

    beforeEach(() => {
      cookie = new CookieModel(req);
      cookie.setOrganisationUsers(apiResponse);
      orgApiStub.resolves(JSON.stringify(apiResponse));     
    });

    it('should display error message if set', async () => {
      req.session.errMsg = { message: 'Example Error Message' };

      const callController = async () => {
          await controller(req, res);
        };

      callController().then(() => {
        expect(req.session.errMsg).to.be.undefined;
        expect(orgApiStub).to.have.been.calledOnceWithExactly('ORGANISATION-ID-1', 'TEST' );
        expect(res.render).to.not.have.been.calledOnceWithExactly('/organisation/index', {
          cookie,
          orgUser: [
            { id: 'PERSON-1', first_name: 'PERSON-1-name', role: { name: 'User' } },
            { id: 'PERSON-4', first_name: 'PERSON-1-name', role: { name: 'User' } },
            { id: 'PERSON-5', first_name: 'PERSON-3-name', role: { name: 'Admin' } },
          ],
          errors: [{ message: 'Example error message' }]
        });
        
      });
    });

    it('should display success message if set', async () => {
      req.session.successMsg = 'Example Success Message';
      req.session.successHeader = 'Successful Header';
      
      const callController = async () => {
        await controller(req, res);
      };

      callController().then(() => {
        expect(req.session.successMsg).to.be.undefined;
        expect(req.session.successHeader).to.be.undefined;
        expect(orgApiStub).to.have.been.calledOnceWithExactly('ORGANISATION-ID-1','TEST');
        expect(res.render).to.not.have.been.calledOnceWithExactly('/organisation/index', {
          cookie,
          orgUser: [
            { id: 'PERSON-1', first_name: 'PERSON-1-name', role: { name: 'User' } },
            { id: 'PERSON-4', first_name: 'PERSON-1-name', role: { name: 'User' } },
            { id: 'PERSON-5', first_name: 'PERSON-3-name', role: { name: 'Admin' } },
          ],
          successHeader: 'Successful Header',
          successMsg: 'Example Success Message'
        });
        
      });
    });

    it('should render with no users if no match', () => {
      const cookie = new CookieModel(req);

      const callController = async () => {
        await controller(req, res);
      };

      callController().then(() => {
        expect(req.session.errMsg).to.be.undefined;
        expect(req.session.successHeader).to.be.undefined;
        expect(req.session.successMsg).to.be.undefined;
        expect(res.render).to.not.have.been.calledOnceWithExactly('/organisation/index', {
          cookie,
          orgUser: [],  
        });
        expect(orgApiStub).to.have.been.calledOnceWithExactly('ORGANISATION-ID-1', 'TEST' );
      });
    });

    it('should render with users if matches', () => {
      const cookie = new CookieModel(req);

      const callController = async () => {
        await controller(req, res);
      };

      callController().then(() => {
        expect(res.render).to.not.have.been.calledOnceWithExactly('/organisation/index', {
          cookie,
          orgUser: [
            { id: 'PERSON-2', first_name: 'PERSON-2-name', role: 'User' },
            { id: 'PERSON-5', first_name: 'PERSON-2-name', role: 'Admin' },
          ],
          
        });
        expect(orgApiStub).to.have.been.calledOnceWithExactly('ORGANISATION-ID-1','TEST');

      });
    });

  });

});

