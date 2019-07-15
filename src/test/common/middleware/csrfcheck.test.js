/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */

const sinon = require('sinon');
const { expect } = require('chai');
const chai = require('chai');
const sinonChai = require('sinon-chai');
const proxyquire = require('proxyquire');

describe('CSRF Check Middleware', () => {
  let res; let req; let next;
  let proxiedMiddleware; let csurfStub;

  beforeEach(() => {
    chai.use(sinonChai);
    process.on('unhandledRejection', (error) => {
      chai.assert.fail(`Unhandled rejection encountered: ${error}`);
    });

    csurfStub = sinon.stub();
    next = sinon.spy();
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should call csurf with secure false', async () => {
    proxiedMiddleware = proxyquire('../../../common/middleware/csrfcheck', {
      csurf: csurfStub,
    });

    await proxiedMiddleware(req, res, next);

    expect(csurfStub).to.have.been.calledOnceWithExactly({
      cookie: {
        httpOnly: true,
        secure: false,
      },
    });
    expect(next).to.have.been.called;
  });

  it('should call csurf with secure true', async () => {
    sinon.stub(process, 'env').value({ COOKIE_SECURE_FLAG: 'true' });
    proxiedMiddleware = proxyquire('../../../common/middleware/csrfcheck', {
      csurf: csurfStub,
    });

    await proxiedMiddleware(req, res, next);

    expect(csurfStub).to.have.been.calledOnceWithExactly({
      cookie: {
        httpOnly: true,
        secure: true,
      },
    });
    expect(next).to.have.been.called;
  });
});
