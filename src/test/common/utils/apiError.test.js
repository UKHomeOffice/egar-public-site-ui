const { expect } = require('chai');
const { getApiErrorBody } = require('../../../common/utils/apiError');

describe('API error utilities', () => {
  it('returns the body of an HTTP error with a string message', () => {
    const body = { message: 'Request failed', identifier: 'name' };

    expect(getApiErrorBody({ type: 'http_error', body })).to.equal(body);
  });

  it('returns undefined for other errors or bodies without a string message', () => {
    expect(getApiErrorBody({ type: 'network_error', body: { message: 'Request failed' } })).to.be.undefined;
    expect(getApiErrorBody({ type: 'http_error', body: { message: 400 } })).to.be.undefined;
    expect(getApiErrorBody(new Error('Request failed'))).to.be.undefined;
  });
});
