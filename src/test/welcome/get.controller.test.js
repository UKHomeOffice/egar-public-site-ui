const sinon = require('sinon');
const expect = require('chai').expect;
const chai = require('chai');
const sinonChai = require('sinon-chai');

const controller = require('../../app/welcome/get.controller');

describe('Welcome Get Controller', () => {
  let req, res;

  beforeEach(() => {
    chai.use(sinonChai);

    // Example request and response objects with appropriate spies
    req = {
    };

    res = {
      render: sinon.spy(),
    };
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should render the welcome page', async() => {
    await controller(req, res);

    expect(res.render).to.have.been.calledWith('app/welcome/index');
  });
});
