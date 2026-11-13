const sinon = require('sinon');
const { expect } = require('chai');
const chai = require('chai');
const sinonChai = require('sinon-chai');
const proxyquire = require('proxyquire');

require('../../global.test');

chai.use(sinonChai);

describe('Logger utility', () => {
  it('logs json-compatible messages with structured metadata', () => {
    const loggerMethods = {
      error: sinon.spy(),
      warn: sinon.spy(),
      debug: sinon.spy(),
      info: sinon.spy(),
    };

    const loggerFactory = proxyquire('../../../common/utils/logger', {
      pino: sinon.stub().returns(loggerMethods),
      './correlationContext': {
        getCorrelationId: () => 'corr-123',
        getSessionId: () => 'sess-456',
      },
      '../config/index': {
        LOG_LEVEL: 'info',
      },
    });

    const logger = loggerFactory('/Users/henrysenior/workspace/egar/egar-public-site-ui/public-site/src/server.js');

    logger.info('Starting up');
    logger.debug('Debugging', { userId: 'user-1' });
    logger.warn('Validation failed');
    logger.error(new Error('Boom'));

    expect(loggerMethods.info.firstCall.args[0]).to.deep.include({
      fileName: '/Users/henrysenior/workspace/egar/egar-public-site-ui/src/server.js',
      correlationId: 'corr-123',
      sessionId: 'sess-456',
    });
    expect(loggerMethods.info.firstCall.args[1]).to.equal('Starting up');
    expect(loggerMethods.info.firstCall.args[0]).to.have.property('lineNumber').that.is.a('number');
    expect(loggerMethods.debug.firstCall.args[0]).to.deep.include({
      fileName: '/Users/henrysenior/workspace/egar/egar-public-site-ui/src/server.js',
      userId: 'user-1',
      correlationId: 'corr-123',
      sessionId: 'sess-456',
    });
    expect(loggerMethods.debug.firstCall.args[1]).to.equal('Debugging');
    expect(loggerMethods.debug.firstCall.args[0]).to.have.property('lineNumber').that.is.a('number');
    expect(loggerMethods.warn.firstCall.args[0]).to.deep.include({
      fileName: '/Users/henrysenior/workspace/egar/egar-public-site-ui/src/server.js',
      correlationId: 'corr-123',
      sessionId: 'sess-456',
    });
    expect(loggerMethods.warn.firstCall.args[1]).to.equal('Validation failed');
    sinon.assert.calledOnce(loggerMethods.error);
    expect(loggerMethods.error.firstCall.args[0]).to.deep.include({
      fileName: '/Users/henrysenior/workspace/egar/egar-public-site-ui/src/server.js',
      correlationId: 'corr-123',
      sessionId: 'sess-456',
    });
    expect(loggerMethods.error.firstCall.args[1]).to.include('Error: Boom');
    expect(loggerMethods.error.firstCall.args[0]).to.have.property('lineNumber').that.is.a('number');
  });
});
