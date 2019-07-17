/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */

const sinon = require('sinon');
const { expect } = require('chai');
const chai = require('chai');
const sinonChai = require('sinon-chai');

const pagination = require('../../common/utils/pagination');

const controller = require('../../app/aircraft/post.controller');

describe('Aircraft Post Controller', () => {
  let req; let res;
  let paginationStub; let sessionSaveStub;
  process.on('unhandledRejection', (error) => {
    chai.assert.fail(`Unhandled rejection encountered: ${error}`);
  });

  beforeEach(() => {
    chai.use(sinonChai);

    req = {
      body: {},
      session: {
        cookie: {},
        save: callback => callback(),
      },
    };

    res = {
      redirect: sinon.stub(),
      render: sinon.stub(),
    };

    paginationStub = sinon.stub(pagination, 'setCurrentPage');
    sessionSaveStub = sinon.stub(req.session, 'save').callsArg(0);
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should do nothing if nextPage or editCraft or deleteCraft are not set', async () => {
    await controller(req, res);

    expect(req.session.editCraftId).to.be.undefined;
    expect(req.session.deleteCraftId).to.be.undefined;
    expect(req.session.save).to.not.have.been.called;
  });

  it('should redirect if nextPage found', () => {
    req.body.nextPage = 6;

    callController = async () => {
      await controller(req, res);
    };

    callController().then(() => {
      expect(paginationStub).to.have.been.called;
      expect(sessionSaveStub).to.have.been.called;
    }).then(() => {
      expect(res.redirect).to.have.been.calledWith('/aircraft');
    });
  });

  it('should redirect to edit', async () => {
    req.body.editCraft = '1234';

    callController = async () => {
      await controller(req, res);
    };

    callController().then(() => {
      expect(req.session.editCraftId).to.eq('1234');
      expect(paginationStub).to.not.have.been.called;
      expect(sessionSaveStub).to.have.been.called;
    }).then(() => {
      expect(res.redirect).to.have.been.calledWith('/aircraft/edit');
    });
  });

  it('should redirect to delete', async () => {
    req.body.deleteCraft = '1234';

    callController = async () => {
      await controller(req, res);
    };

    callController().then(() => {
      expect(req.session.deleteCraftId).to.eq('1234');
      expect(paginationStub).to.not.have.been.called;
      expect(sessionSaveStub).to.have.been.called;
    }).then(() => {
      expect(res.redirect).to.have.been.calledWith('/aircraft/delete');
    });
  });
});
