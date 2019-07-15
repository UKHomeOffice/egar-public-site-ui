/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */

const sinon = require('sinon');
const { expect } = require('chai');
const chai = require('chai');
const sinonChai = require('sinon-chai');

const controller = require('../../app/welcome/post.controller');

describe('Welcome Post Controller', () => {
  let req; let res;

  beforeEach(() => {
    chai.use(sinonChai);
    process.on('unhandledRejection', (error) => {
      chai.assert.fail(`Unhandled rejection encountered: ${error}`);
    });

    // Example request and response objects with appropriate spies
    req = {
    };

    res = {
      render: sinon.spy(),
      redirect: sinon.spy(),
    };
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should redirect to the login page', async () => {
    await controller(req, res);

    expect(res.render).to.not.have.been.called;
    expect(res.redirect).to.have.been.calledWith('/login');
  });
});
