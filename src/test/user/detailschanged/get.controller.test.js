/* eslint-disable no-undef */
const sinon = require('sinon');
const { expect } = require('chai');
const chai = require('chai');
const sinonChai = require('sinon-chai');

const controller = require('../../../app/user/detailschanged/get.controller');

describe('Manage User Detail Get Controller', () => {
  let req; let res;

  beforeEach(() => {
    chai.use(sinonChai);
    process.on('unhandledRejection', (error) => {
      chai.assert.fail(`Unhandled rejection encountered: ${error}`);
    });

    req = {
      session: {},
    };

    res = {
      render: sinon.spy(),
    };
    // Need to figure out how to stub the CookieModel and its constructor,
    // in order to just check it is instantiated
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should render the appropriate page', async () => {
    await controller(req, res);

    expect(res.render).to.have.been.calledWith('app/user/detailschanged/index');
  });
});
