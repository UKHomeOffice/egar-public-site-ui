/* eslint-disable no-undef */

const sinon = require('sinon');
const { expect } = require('chai');
const chai = require('chai');
const sinonChai = require('sinon-chai');

require('../global.test');

const controller = require('../../app/welcome/get.controller');

describe('Welcome Get Controller', () => {
  let req; let res;

  beforeEach(() => {
    chai.use(sinonChai);

    req = {};
    res = {
      render: sinon.spy(),
    };
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should render the welcome page', async () => {
    await controller(req, res);

    expect(res.render).to.have.been.calledWith('app/welcome/index');
  });
});
