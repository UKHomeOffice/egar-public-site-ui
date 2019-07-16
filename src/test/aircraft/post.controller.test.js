/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */

const sinon = require('sinon');
const { expect } = require('chai');
const chai = require('chai');
const sinonChai = require('sinon-chai');

const controller = require('../../app/aircraft/post.controller');

describe('Aircraft Post Controller', () => {
  let res;

  beforeEach(() => {
    chai.use(sinonChai);

    // Example response object with appropriate spies
    res = {
      redirect: sinon.stub(),
      render: sinon.stub(),
    };
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should do nothing if editCraft or deleteCraft are not set', async () => {
    const emptyRequest = {
      body: {
      },
      session: {
        cookie: {},
        save: sinon.spy(),
      },
    };

    await controller(emptyRequest, res);

    expect(emptyRequest.session.editCraftId).to.be.undefined;
    expect(emptyRequest.session.deleteCraftId).to.be.undefined;
    expect(emptyRequest.session.save).to.not.have.been.called;
  });

  it('should redirect to edit', async () => {
    const editRequest = {
      body: {
        currentPage: 4,
        editCraft: '1234',
      },
      session: {
        cookie: {},
        save: callback => callback(),
      },
    };
    const sessionSaveStub = sinon.stub(editRequest.session, 'save').callsArg(0);

    callController = async () => {
      await controller(editRequest, res);
    };

    callController().then(() => {
      expect(editRequest.session.editCraftId).to.eq('1234');
      expect(sessionSaveStub).to.have.been.called;
    }).then(() => {
      expect(res.redirect).to.have.been.calledWith('/aircraft/edit?page=4');
    });
  });

  it('should redirect to delete', async () => {
    const deleteRequest = {
      body: {
        currentPage: 3,
        deleteCraft: '1234',
      },
      session: {
        cookie: {},
        save: callback => callback(),
      },
    };
    const sessionSaveStub = sinon.stub(deleteRequest.session, 'save').callsArg(0);

    callController = async () => {
      await controller(deleteRequest, res);
    };

    callController().then(() => {
      expect(deleteRequest.session.deleteCraftId).to.eq('1234');
      expect(sessionSaveStub).to.have.been.called;
    }).then(() => {
      expect(res.redirect).to.have.been.calledWith('/aircraft/delete?page=3');
    });
  });
});
