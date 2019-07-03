const sinon = require('sinon');
const expect = require('chai').expect;
const chai = require('chai');
const sinonChai = require('sinon-chai');

const controller = require('../../app/welcome/post.controller');

describe('Welcome Post Controller', () => {
  let req, res;

  beforeEach(() => {
    chai.use(sinonChai);

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

  it('should redirect to the login page', async() => {
    await controller(req, res);

    expect(res.render).to.not.have.been.called;
    expect(res.redirect).to.have.been.calledWith('/login');
  });
});
