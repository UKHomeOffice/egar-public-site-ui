/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */

import sinon from 'sinon';
import { expect } from 'chai';
import chai from 'chai';
import sinonChai from 'sinon-chai';
import esmock from 'esmock';
import '../../global.test.js';

describe('CSRF Check Middleware', () => {
  let res; let req; let next;
  let csurfStub;

  beforeEach(() => {
    chai.use(sinonChai);

    csurfStub = sinon.stub();
    next = sinon.spy();
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should call csurf with secure false', async () => {
    const proxiedMiddleware = await esmock('../../../common/middleware/csrfcheck.js', {
      'csurf': csurfStub,
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
    
    const proxiedMiddleware = await esmock('../../../common/middleware/csrfcheck.js', {
      'csurf': csurfStub,
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