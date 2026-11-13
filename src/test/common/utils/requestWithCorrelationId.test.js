const sinon = require('sinon');
const { expect } = require('chai');
const chai = require('chai');
const sinonChai = require('sinon-chai');
const proxyquire = require('proxyquire');

require('../../global.test');

describe('Request correlation id wrapper', () => {
  beforeEach(() => {
    chai.use(sinonChai);
  });

  it('adds the active correlation id to outbound request headers', () => {
    const request = {
      post: sinon.spy(),
    };

    const { createRequestWithCorrelationId } = proxyquire('../../../common/utils/requestWithCorrelationId', {
      './correlationContext': {
        getCorrelationId: () => 'corr-123',
      },
    });

    const wrapped = createRequestWithCorrelationId(request);

    wrapped.post(
      {
        headers: { 'content-type': 'application/json' },
        url: 'http://example.com',
      },
      () => {}
    );

    expect(request.post).to.have.been.calledOnce;
    expect(request.post.firstCall.args[0]).to.eql({
      headers: {
        'content-type': 'application/json',
        'X-Correlation-ID': 'corr-123',
      },
      url: 'http://example.com',
    });
  });
});
