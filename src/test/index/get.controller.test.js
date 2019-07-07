/* eslint-disable no-undef */

const sinon = require('sinon');
const { expect } = require('chai');
const chai = require('chai');
const sinonChai = require('sinon-chai');

const controller = require('../../app/index/get.controller');

describe('Index Get Controller', () => {
  let req; let res;

  beforeEach(() => {
    chai.use(sinonChai);

    // Example request and response objects with appropriate spies
    req = {
      session: {},
    };
    res = {
      redirect: sinon.spy(),
    };
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should redirect to the welcome page', async () => {
    await controller(req, res);

    expect(res.redirect).to.have.been.calledWith('/welcome/index');
  });
});
