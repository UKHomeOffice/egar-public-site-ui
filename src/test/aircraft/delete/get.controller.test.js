/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */

import sinon from 'sinon';

import { expect } from 'chai';
import chai from 'chai';
import sinonChai from 'sinon-chai';
import '../../global.test.js';
import craftApi from '../../../common/services/craftApi.js';
import controller from '../../../app/aircraft/delete/get.controller.js';

describe('Aircraft Delete Get Controller', () => {
  let req; let res; let deleteCraftStub; let deleteOrgCraftStub;

  beforeEach(() => {
    chai.use(sinonChai);

    req = {
      session: {
        deleteCraftId: 'G-ABCD',
        save: callback => callback(),
        u: {
          dbId: 'someone@somewhere.net',
        },
      },
      cookie: {
        u: {},
      },
    };
    res = {
      redirect: sinon.spy(),
    };
    deleteCraftStub = sinon.stub(craftApi, 'deleteCraft');
    deleteOrgCraftStub = sinon.stub(craftApi, 'deleteOrgCraft');
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should redirect if craftId is undefined', async () => {
    delete req.session.deleteCraftId;

    await controller(req, res);

    expect(deleteCraftStub).to.not.have.been.called;
    expect(deleteOrgCraftStub).to.not.have.been.called;
    expect(res.redirect).to.have.been.calledWith('/aircraft');
  });

  describe('individuals', () => {
    beforeEach(() => {
      req.session.u.rl = 'Admin';
      req.session.org = {
        i: 12345,
      };
    });

    it('should redirect if with success message', () => {
      deleteOrgCraftStub.resolves(JSON.stringify({}));
      const sessionSaveStub = sinon.stub(req.session, 'save').callsArg(0);

      const callController = async () => {
        await controller(req, res);
      };

      callController().then(() => {
        expect(req.session.errMsg).to.be.undefined;
        expect(req.session.successHeader).to.eq('Success');
        expect(req.session.successMsg).to.eq('Your aircraft has been deleted');
        expect(deleteOrgCraftStub).to.have.been.calledWith(12345, 'someone@somewhere.net', 'G-ABCD');
        expect(deleteCraftStub).to.not.have.been.called;
        expect(sessionSaveStub).to.have.been.called;
        expect(res.redirect).to.have.been.calledWith('/aircraft');
      });
    });

    it('should redirect if craft api responds with an error', () => {
      deleteOrgCraftStub.resolves(JSON.stringify({
        message: 'Example error message',
      }));
      const sessionSaveStub = sinon.stub(req.session, 'save').callsArg(0);

      const callController = async () => {
        await controller(req, res);
      };

      callController().then(() => {
        expect(req.session.errMsg).to.eql({ message: 'Failed to delete craft. Try again' });
        expect(deleteOrgCraftStub).to.have.been.calledWith(12345, 'someone@somewhere.net', 'G-ABCD');
        expect(deleteCraftStub).to.not.have.been.called;
        expect(sessionSaveStub).to.have.been.called;
        expect(res.redirect).to.have.been.calledWith('/aircraft');
      });
    });

    it('should redirect if craft api rejects', () => {
      deleteOrgCraftStub.rejects('craftApi.deleteOrgCraft Example Reject');
      const sessionSaveStub = sinon.stub(req.session, 'save').callsArg(0);

      const callController = async () => {
        await controller(req, res);
      };

      callController().then(() => {
        expect(deleteOrgCraftStub).to.have.been.calledWith(12345, 'someone@somewhere.net', 'G-ABCD');
        expect(deleteCraftStub).to.not.have.been.called;
        expect(sessionSaveStub).to.have.been.called;
        expect(res.redirect).to.have.been.calledWith('/aircraft');
      });
    });
  });

  describe('organisations', () => {
    beforeEach(() => {
      req.session.u.rl = 'Individual';
    });

    it('should redirect with success message', () => {
      deleteCraftStub.resolves(JSON.stringify({}));
      const sessionSaveStub = sinon.stub(req.session, 'save').callsArg(0);

      const callController = async () => {
        await controller(req, res);
      };

      callController().then(() => {
        expect(req.session.errMsg).to.be.undefined;
        expect(req.session.successHeader).to.eq('Success');
        expect(req.session.successMsg).to.eq('Your aircraft has been deleted');
        expect(deleteCraftStub).to.have.been.calledWith('someone@somewhere.net', 'G-ABCD');
        expect(deleteOrgCraftStub).to.not.have.been.called;
        expect(sessionSaveStub).to.have.been.called;
        expect(res.redirect).to.have.been.calledWith('/aircraft');
      });
    });

    it('should redirect if craft api responds with an error', () => {
      deleteCraftStub.resolves(JSON.stringify({
        message: 'Example error message',
      }));
      const sessionSaveStub = sinon.stub(req.session, 'save').callsArg(0);

      const callController = async () => {
        await controller(req, res);
      };

      callController().then(() => {
        expect(req.session.errMsg).to.eql({ message: 'Failed to delete craft. Try again' });
        expect(deleteCraftStub).to.have.been.calledWith('someone@somewhere.net', 'G-ABCD');
        expect(deleteOrgCraftStub).to.not.have.been.called;
        expect(sessionSaveStub).to.have.been.called;
        expect(res.redirect).to.have.been.calledWith('/aircraft');
      });
    });

    it('should redirect if craft api rejects', () => {
      deleteCraftStub.rejects('craftApi.deleteCraft Example Reject');
      const sessionSaveStub = sinon.stub(req.session, 'save').callsArg(0);

      const callController = async () => {
        await controller(req, res);
      };

      callController().then(() => {
        expect(deleteCraftStub).to.have.been.calledWith('someone@somewhere.net', 'G-ABCD');
        expect(deleteOrgCraftStub).to.not.have.been.called;
        expect(sessionSaveStub).to.have.been.called;
        expect(res.redirect).to.have.been.calledWith('/aircraft');
      });
    });
  });
});
