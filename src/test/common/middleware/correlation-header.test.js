/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */
const sinon = require('sinon');
const { expect } = require('chai');
const chai = require('chai');
const sinonChai = require('sinon-chai');

require('../../global.test');

const middleware = require('../../../common/middleware/correlation-header');

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
