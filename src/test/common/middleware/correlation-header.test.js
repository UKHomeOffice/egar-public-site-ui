/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */
const sinon = require('sinon');
const { expect } = require('chai');
const chai = require('chai');
const sinonChai = require('sinon-chai');

const middleware = require('../../../common/middleware/correlation-header');

describe('Correlation Header Middleware', () => {
  let res; let req; let next;

  beforeEach(() => {
    chai.use(sinonChai);
    process.on('unhandledRejection', (error) => {
      chai.assert.fail(`Unhandled rejection encountered: ${error}`);
    });

    req = {
      headers: {},
    };

    next = sinon.spy();
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
