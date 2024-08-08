/* eslint-disable no-undef */
/* eslint-disable no-unused-expressions */

const sinon = require('sinon');
const { expect } = require('chai');
const chai = require('chai');
const sinonChai = require('sinon-chai');

require('../global.test');

const controller = require('../../app/organisation/post.controller');
const pagination = require('../../common/utils/pagination');

describe('Organisation Post Controller', () => {
  let req; let res; let saveSessionStub;
  let paginationStub;

  beforeEach(() => {
    chai.use(sinonChai);

    req = {
      body: {},
      session: {
        save: callback => callback(),
      },
    };

    res = {
      redirect: sinon.spy(),
    };

    paginationStub = sinon.stub(pagination, 'setCurrentPage');
    saveSessionStub = sinon.stub(req.session, 'save').callsArg(0);
  });

  afterEach(() => {
    sinon.restore();
  });


   it('should do nothing if nextPage is not set', async () => {
    await controller(req, res);
    expect(req.session.save).to.not.have.been.called;
  });

  it('should redirect if nextPage found 11', () => {
    req.body.nextPage = 6;

    callController = async () => {
      await controller(req, res);
    };

    callController().then(() => {
      expect(paginationStub).to.have.been.called;
      expect(saveSessionStub).to.have.been.called;
    }).then(() => {
      expect(res.redirect).to.have.been.calledWith('/organisation');
    });
  });

  it('should redirect to editorganisation if editOrgUser set', () => {
    req.body.editOrg = 'ORG-ID-1';

    const callController = async () => {
      await controller(req, res);
    };

    callController().then(() => {
      expect(req.session.editOrgId).to.eq('ORG-ID-1');
      expect(saveSessionStub).to.have.been.called;
      expect(res.redirect).to.have.been.calledOnceWithExactly('/organisation/editorganisation');
    });
  });

  it('should redirect to editorganisation if editOrgUser set', () => {
    req.body.editOrgUser = 'USER-ID-1';

    const callController = async () => {
      await controller(req, res);
    };

    callController().then(() => {
      expect(req.session.editUserId).to.eq('USER-ID-1');
      expect(saveSessionStub).to.have.been.called;
      expect(res.redirect).to.have.been.calledOnceWithExactly('/organisation/users/edit');
    });
  });

  it('should do nothing if not parameters set', () => {
    const callController = async () => {
      await controller(req, res);
    };

    callController().then(() => {
      expect(req.session.editUserId).to.be.undefined;
      expect(req.session.editOrgId).to.be.undefined;
      expect(saveSessionStub).to.not.have.been.called;
      expect(res.redirect).to.not.have.been.called;
    });
  });

  it('should redirect to search organisation user if organisation_search set', () => {
    req.body.organisation_search = 'TESTUSER';

    const callController = async () => {
      await controller(req, res);
    };

    callController().then(() => {
      expect(req.body.organisation_search).to.eq('TESTUSER');
      expect(req.session.searchUserName).to.eq('TESTUSER');
      expect(saveSessionStub).to.have.been.called;
      expect(res.redirect).to.have.been.calledOnceWithExactly('/organisation/users/search');
    });
  });
});
