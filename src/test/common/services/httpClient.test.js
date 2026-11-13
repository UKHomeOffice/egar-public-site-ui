const { expect } = require('chai');

require('../../global.test');

const { HttpClient } = require('../../../common/services/httpClient');
const { correlationIdMiddleware } = require('../../../common/utils/correlationContext');

describe('HttpClient correlation id', () => {
  it('reuses the same correlation id for all requests in one request context', async () => {
    const requests = [];
    const originalFetch = global.fetch;

    global.fetch = async (url, options) => {
      requests.push({
        url,
        headers: options.headers,
      });

      return {
        ok: true,
        json: async () => ({}),
      };
    };

    try {
      await new Promise((resolve, reject) => {
        correlationIdMiddleware({}, { setHeader: () => {} }, async () => {
          try {
            const client = new HttpClient({ baseUrl: 'http://example.com' });
            await client.get('/first');
            await client.get('/second');
            resolve();
          } catch (error) {
            reject(error);
          }
        });
      });
    } finally {
      global.fetch = originalFetch;
    }

    expect(requests).to.have.length(2);
    expect(requests[0].headers['X-Correlation-ID']).to.be.a('string');
    expect(requests[1].headers['X-Correlation-ID']).to.equal(requests[0].headers['X-Correlation-ID']);
  });
});
