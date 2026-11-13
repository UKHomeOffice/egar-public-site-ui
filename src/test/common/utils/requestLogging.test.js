const sinon = require('sinon');
const { expect } = require('chai');
const chai = require('chai');
const sinonChai = require('sinon-chai');
const proxyquire = require('proxyquire');
const { EventEmitter } = require('events');

require('../../global.test');

chai.use(sinonChai);

describe('requestLogging middleware', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('logs request start with method and url', () => {
    const loggerMethods = {
      error: sinon.spy(),
      warn: sinon.spy(),
      debug: sinon.spy(),
      info: sinon.spy(),
    };

    const requestLoggingMiddleware = proxyquire('../../../common/utils/requestLogging', {
      './logger': sinon.stub().returns(loggerMethods),
      './correlationContext': {
        getCorrelationId: sinon.stub().returns('corr-123'),
      },
    });

    const req = {
      method: 'GET',
      originalUrl: '/welcome/index',
      httpVersion: '1.1',
      sessionID: 'sess-123',
      headers: {
        referer: '-',
        'user-agent': 'test-agent',
      },
    };
    const res = new EventEmitter();
    const next = sinon.spy();

    requestLoggingMiddleware(req, res, next);

    expect(loggerMethods.info).to.have.been.calledOnceWithExactly('HTTP request start', {
      method: 'GET',
      url: '/welcome/index',
      httpVersion: '1.1',
      referrer: '-',
      userAgent: 'test-agent',
      sessionId: 'sess-123',
      correlationId: 'corr-123',
    });
    expect(next).to.have.been.calledOnce;
  });

  it('skips static assets', () => {
    const loggerMethods = {
      error: sinon.spy(),
      warn: sinon.spy(),
      debug: sinon.spy(),
      info: sinon.spy(),
    };

    const requestLoggingMiddleware = proxyquire('../../../common/utils/requestLogging', {
      './logger': sinon.stub().returns(loggerMethods),
      './correlationContext': {
        getCorrelationId: sinon.stub().returns('corr-123'),
      },
    });

    const req = {
      method: 'GET',
      path: '/assets/site.css',
    };
    const res = new EventEmitter();
    const next = sinon.spy();

    requestLoggingMiddleware(req, res, next);

    expect(loggerMethods.info).not.to.have.been.called;
    expect(next).to.have.been.calledOnce;
  });
});
