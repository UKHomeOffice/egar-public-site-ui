/* eslint-disable no-undef */
/* eslint-disable no-unused-expressions */

const sinon = require('sinon');
const { expect } = require('chai');
const chai = require('chai');
const sinonChai = require('sinon-chai');

const controller = require('../../app/organisation/post.controller');

describe('Organisation Post Controller', () => {
  let req; let res; let saveSessionStub;

  beforeEach(() => {
    chai.use(sinonChai);
    process.on('unhandledRejection', (error) => {
      chai.assert.fail(`Unhandled rejection encountered: ${error}`);
    });

    req = {
      body: {},
      session: {
        save: callback => callback(),
      },
    };

    res = {
      redirect: sinon.spy(),
    };

    saveSessionStub = sinon.stub(req.session, 'save').callsArg(0);
  });

  afterEach(() => {
    sinon.restore();
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
});
