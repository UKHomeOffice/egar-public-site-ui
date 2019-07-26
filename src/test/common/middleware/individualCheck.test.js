/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */

const sinon = require('sinon');
const { expect } = require('chai');
const chai = require('chai');
const sinonChai = require('sinon-chai');

require('../../global.test');
const middleware = require('../../../common/middleware/individualCheck');

describe('Individual Check Middleware', () => {
  let res; let req; let next;

  beforeEach(() => {
    chai.use(sinonChai);

    req = {
      body: {},
      session: {
        org: { i: '12345' },
      },
    };

    res = {
      redirect: sinon.spy(),
    };

    csurfStub = sinon.stub();
    next = sinon.spy();
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should redirect if org is set', async () => {
    await middleware(req, res, next);

    expect(res.redirect).to.have.been.calledOnceWithExactly('/error/404');
    expect(next).to.not.have.been.called;
  });

  it('should redirect if org id is true', async () => {
    req.session.org.i = true;

    await middleware(req, res, next);

    expect(res.redirect).to.have.been.calledOnceWithExactly('/error/404');
    expect(next).to.not.have.been.called;
  });

  it('should redirect if org id is false', async () => {
    req.session.org.i = false;

    await middleware(req, res, next);

    expect(res.redirect).to.have.been.calledOnceWithExactly('/error/404');
    expect(next).to.not.have.been.called;
  });

  it('should go to next if org id is null', async () => {
    req.session.org.i = null;

    await middleware(req, res, next);

    expect(res.redirect).to.not.have.been.called;
    expect(next).to.have.been.called;
  });

  it('should go to next if ok', async () => {
    delete req.session.org.i;

    await middleware(req, res, next);

    expect(res.redirect).to.not.have.been.called;
    expect(next).to.have.been.called;
  });
});
