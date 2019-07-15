/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */

const sinon = require('sinon');
const { expect } = require('chai');
const chai = require('chai');
const sinonChai = require('sinon-chai');

const middleware = require('../../../common/middleware/usercheck');

describe('User Check Middleware', () => {
  let res; let req; let next;

  beforeEach(() => {
    chai.use(sinonChai);
    process.on('unhandledRejection', (error) => {
      chai.assert.fail(`Unhandled rejection encountered: ${error}`);
    });

    req = {
      headers: { referer: 'example' },
      body: {},
      session: {
        u: { dbId: 'user-db-id-1' },
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

  it('should redirect if referer is undefined', async () => {
    delete req.headers.referer;
    await middleware(req, res, next);

    expect(res.redirect).to.have.been.calledOnceWithExactly('/login');
    expect(next).to.not.have.been.called;
  });

  it('should redirect if userDBId is null', async () => {
    req.session.u.dbId = null;
    await middleware(req, res, next);

    expect(res.redirect).to.have.been.calledOnceWithExactly('/login');
    expect(next).to.not.have.been.called;
  });

  it('should redirect if userDbId is undefined', async () => {
    delete req.session.u.dbId;
    await middleware(req, res, next);

    expect(res.redirect).to.have.been.calledOnceWithExactly('/login');
    expect(next).to.not.have.been.called;
  });

  it('should go to next if ok', async () => {
    await middleware(req, res, next);

    expect(res.redirect).to.not.have.been.called;
    expect(next).to.have.been.called;
  });
});
