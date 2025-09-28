/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */
import sinon from 'sinon';

import { expect } from 'chai';
import chai from 'chai';
import sinonChai from 'sinon-chai';
import '../../global.test.js';
import middleware from '../../../common/middleware/correlation-header.js';

describe('Correlation Header Middleware', () => {
  let res; let req; let next;

  beforeEach(() => {
    chai.use(sinonChai);

    req = {
      headers: {},
    };

    next = sinon.spy();
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should leave blank if CORRELATION_HEADER not set', () => {
    middleware(req, res, next);

    expect(req.correlationId).to.eq('');
    expect(next).to.have.been.called;
  });

  it('should set if CORRELATION_HEADER present', () => {
    req.headers['x-request-id'] = 'CORRELATION-ID';

    middleware(req, res, next);

    expect(req.correlationId).to.eq('CORRELATION-ID');
    expect(next).to.have.been.called;
  });
});
