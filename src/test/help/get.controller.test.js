const sinon = require('sinon');
const { expect } = require('chai');
const chai = require('chai');
const sinonChai = require('sinon-chai');

require('../global.test');

const controller = require('../../app/help/get.controller');

describe('Help Get Controller', () => {
  let req;
  let res;

  beforeEach(() => {
    chai.use(sinonChai);

    req = {
      session: {},
      query: {},
    };
    res = {
      render: sinon.spy(),
    };
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should render main help page', async () => {
    await controller(req, res);

    expect(res.render).to.have.been.calledWith('app/help/index');
  });
});
