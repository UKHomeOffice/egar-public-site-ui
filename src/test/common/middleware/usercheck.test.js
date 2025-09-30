/* eslint-disable no-undef */

const sinon = require('sinon');
const { expect } = require('chai');
const chai = require('chai');
const sinonChai = require('sinon-chai');

require('../../global.test');
const middleware = require('../../../common/middleware/usercheck');

describe('User Check Middleware', () => {
  let res;
  let req;
  let next;

  beforeEach(() => {
    chai.use(sinonChai);

    req = {
      headers: { referer: 'example' },
      body: {},
      session: {
        u: {
          dbId: 'user-db-id-1',
          rl: 'User',
          vr: true,
        },
        reload: sinon.spy(),
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

  it('should redirect if userDBId is null', async () => {
    req.session.u.dbId = null;
    await middleware(req, res, next);

    expect(res.redirect).to.have.been.calledOnceWithExactly('/welcome/index');
    expect(next).to.not.have.been.called;
  });

  it('should redirect if userDbId is undefined', async () => {
    delete req.session.u.dbId;
    await middleware(req, res, next);

    expect(res.redirect).to.have.been.calledOnceWithExactly('/welcome/index');
    expect(next).to.not.have.been.called;
  });

  it('should redirect if userRole is null', async () => {
    req.session.u.rl = null;
    await middleware(req, res, next);

    expect(res.redirect).to.have.been.calledOnceWithExactly('/welcome/index');
    expect(next).to.not.have.been.called;
  });

  it('should redirect if userRole is null', async () => {
    delete req.session.u.rl;
    await middleware(req, res, next);

    expect(res.redirect).to.have.been.calledOnceWithExactly('/welcome/index');
    expect(next).to.not.have.been.called;
  });

  it('should redirect if userVerified is null', async () => {
    req.session.u.vr = null;
    await middleware(req, res, next);

    expect(res.redirect).to.have.been.calledOnceWithExactly('/welcome/index');
    expect(next).to.not.have.been.called;
  });

  it('should redirect if userVerified is null', async () => {
    delete req.session.u.vr;
    await middleware(req, res, next);

    expect(res.redirect).to.have.been.calledOnceWithExactly('/welcome/index');
    expect(next).to.not.have.been.called;
  });

  it('should redirect if userVerified is false', async () => {
    req.session.u.vr = false;
    await middleware(req, res, next);

    expect(res.redirect).to.have.been.calledOnceWithExactly('/welcome/index');
    expect(next).to.not.have.been.called;
  });

  it('should go to next if ok', async () => {
    await middleware(req, res, next);

    expect(res.redirect).to.not.have.been.called;
    expect(next).to.have.been.called;
  });
});
