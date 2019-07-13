/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */

const sinon = require('sinon');
const { expect } = require('chai');
const chai = require('chai');
const sinonChai = require('sinon-chai');

const controller = require('../../../app/user/viewDetails/post.controller');

describe('Aircraft Post Controller', () => {
  let res;

  beforeEach(() => {
    chai.use(sinonChai);
    process.on('unhandledRejection', (error) => {
      chai.assert.fail(`Unhandled rejection encountered: ${error}`);
    });

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
  });

  it('should redirect to craft edit', async () => {
    const editRequest = {
      body: {
        editCraft: '1234',
      },
      session: {
        cookie: {},
        save: callback => callback(),
      },
    };
    callController = async () => {
      await controller(editRequest, res);
    };

    callController().then(() => {
      expect(editRequest.session.editCraftId).to.eq('1234');
      expect(res.redirect).to.have.been.calledWith('/user/savedcraft/edit');
    });
  });

  it('should redirect to craft delete', async () => {
    const deleteRequest = {
      body: {
        deleteCraft: '1234',
      },
      session: {
        cookie: {},
        save: callback => callback(),
      },
    };

    callController = async () => {
      await controller(deleteRequest, res);
    };

    callController().then(() => {
      expect(deleteRequest.session.deleteCraftId).to.eq('1234');
      expect(res.redirect).to.have.been.calledWith('/user/savedcraft/delete');
    });
  });

  it('should redirect to people edit', async () => {
    const deleteRequest = {
      body: {
        editPerson: 'ABCDEFG',
      },
      session: {
        cookie: {},
        save: callback => callback(),
      },
    };

    callController = async () => {
      await controller(deleteRequest, res);
    };

    callController().then(() => {
      expect(deleteRequest.session.editPersonId).to.eq('ABCDEFG');
      expect(res.redirect).to.have.been.calledWith('/user/savedpeople/edit');
    });
  });
});
