const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');

require('../../global.test');

chai.use(sinonChai);

const { expect } = chai;
const { HttpClient } = require('../../../common/services/httpClient');
const { correlationIdMiddleware } = require('../../../common/utils/correlationContext');

function response({ status = 200, statusText = 'OK', body, contentType = 'application/json' } = {}) {
  const text = body === undefined ? '' : typeof body === 'string' ? body : JSON.stringify(body);
  return {
    status,
    ok: status >= 200 && status < 300,
    statusText,
    headers: {
      get: (name) => (name.toLowerCase() === 'content-type' ? contentType : null),
    },
    text: async () => text,
  };
}

async function rejected(promise) {
  try {
    await promise;
  } catch (error) {
    return error;
  }
  throw new Error('Expected the request to reject');
}

describe('HttpClient', () => {
  let originalFetch;

  beforeEach(() => {
    originalFetch = global.fetch;
  });

  afterEach(() => {
    global.fetch = originalFetch;
    sinon.restore();
  });

  describe('request URLs', () => {
    it('rejects relative, non-HTTP(S), and untrusted URLs before calling Fetch', async () => {
      const fetchStub = sinon.stub().resolves(response({ body: {} }));
      global.fetch = fetchStub;
      const client = new HttpClient({ baseUrl: 'https://api.example.test/v1' });

      for (const path of [
        'relative/path',
        'ftp://api.example.test/gar',
        'https://other.example.test/gar',
        '//other.example.test/gar',
      ]) {
        const error = await rejected(client.get(path));
        expect(error).to.be.instanceOf(TypeError);
      }

      expect(fetchStub).to.not.have.been.called;
    });

    it('uses the configured origin for relative API paths and encodes query parameters', async () => {
      const fetchStub = sinon.stub().resolves(response({ body: { id: 'GAR-1' } }));
      global.fetch = fetchStub;
      const client = new HttpClient({ baseUrl: 'https://api.example.test/v1' });

      await client.get('/gar/GAR-1', { query: { search: 'A & B', omitted: undefined, cbp_id: false } });

      expect(fetchStub.firstCall.args[0].href).to.equal(
        'https://api.example.test/v1/gar/GAR-1?search=A+%26+B&cbp_id=false'
      );
    });

    it('rejects an invalid configured base URL', () => {
      expect(() => new HttpClient({ baseUrl: '/v1' })).to.throw(TypeError);
      expect(() => new HttpClient({ baseUrl: 'file:///tmp/api' })).to.throw(TypeError);
    });
  });

  describe('Fetch requests', () => {
    it('supports all public methods, headers, query parameters, and JSON request bodies', async () => {
      const requests = [];
      global.fetch = async (url, options) => {
        requests.push({ url: url.href, ...options });
        return response({ body: { accepted: true } });
      };
      const client = new HttpClient({ baseUrl: 'https://api.example.test/v1' });

      await client.get('/get', { query: { page: 2 }, headers: { Authorization: 'Bearer token' } });
      await client.post('/post', { action: 'create' }, { headers: { 'content-type': 'application/vnd.api+json' } });
      await client.put('/put', { action: 'replace' });
      await client.patch('/patch', { action: 'update' });
      await client.delete('/delete', { query: { force: true }, body: { id: 'GAR-1' } });

      expect(requests.map(({ method }) => method)).to.deep.equal(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']);
      expect(requests[0].url).to.equal('https://api.example.test/v1/get?page=2');
      expect(requests[0].headers.Authorization).to.equal('Bearer token');
      expect(Object.keys(requests[1].headers).filter((name) => name.toLowerCase() === 'content-type')).to.have.length(
        1
      );
      expect(requests[1].headers['Content-Type']).to.equal('application/vnd.api+json');
      expect(requests.slice(1).map(({ body }) => body)).to.deep.equal([
        '{"action":"create"}',
        '{"action":"replace"}',
        '{"action":"update"}',
        '{"id":"GAR-1"}',
      ]);
      expect(requests.every(({ headers }) => headers.Accept === 'application/json')).to.equal(true);
      expect(requests.some((requestOptions) => Object.hasOwn(requestOptions, 'redirect'))).to.equal(false);
    });

    it('sends URL-encoded and FormData bodies without JSON serialization', async () => {
      const requests = [];
      global.fetch = async (_url, options) => {
        requests.push(options);
        return response({ body: {} });
      };
      const client = new HttpClient({ baseUrl: 'https://api.example.test' });
      const formData = new FormData();
      const fileBytes = Buffer.from('file content');
      formData.append('name', 'evidence.txt');
      formData.append('document', new Blob([fileBytes]), 'evidence.txt');

      await client.post('/encoded', new URLSearchParams({ name: 'A & B' }));
      await client.post('/multipart', formData);

      expect(requests[0].body).to.equal('name=A+%26+B');
      expect(requests[0].headers['Content-Type']).to.equal('application/x-www-form-urlencoded;charset=UTF-8');
      expect(requests[1].body).to.equal(formData);
      expect(requests[1].body.get('name')).to.equal('evidence.txt');
      expect(requests[1].body.get('document').name).to.equal('evidence.txt');
      expect(Buffer.from(await requests[1].body.get('document').arrayBuffer())).to.deep.equal(fileBytes);
      expect(requests[1].headers).to.not.have.property('Content-Type');
    });

    it('propagates one correlation ID across requests in a request context', async () => {
      const requests = [];
      global.fetch = async (url, options) => {
        requests.push({ url, headers: options.headers });
        return response({ body: {} });
      };

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

      expect(requests).to.have.length(2);
      expect(requests[0].headers['X-Correlation-ID']).to.be.a('string');
      expect(requests[1].headers['X-Correlation-ID']).to.equal(requests[0].headers['X-Correlation-ID']);
    });
  });

  describe('responses and errors', () => {
    it('decodes JSON, text, and empty responses', async () => {
      const responses = [
        response({ body: { id: 'GAR-1' } }),
        response({ body: 'accepted', contentType: 'text/plain' }),
        response({ status: 204, statusText: 'No Content' }),
      ];
      global.fetch = sinon.stub().callsFake(async () => responses.shift());
      const client = new HttpClient({ baseUrl: 'https://api.example.test' });

      expect(await client.get('/json')).to.deep.equal({ ok: true, id: 'GAR-1' });
      expect(await client.get('/text')).to.equal('accepted');
      expect(await client.get('/empty')).to.equal(null);
    });

    it('throws an Error with Fetch HTTP metadata and the decoded response body', async () => {
      global.fetch = sinon.stub().resolves(
        response({
          status: 422,
          statusText: 'Unprocessable Entity',
          body: { message: 'Invalid GAR' },
        })
      );
      const client = new HttpClient({ baseUrl: 'https://api.example.test/v1' });
      const error = await rejected(client.patch('/gar/GAR-1', { status: 'Draft' }));

      expect(error).to.be.instanceOf(Error);
      expect(error).to.include({
        type: 'http_error',
        status: 422,
        statusText: 'Unprocessable Entity',
        url: 'https://api.example.test/v1/gar/GAR-1',
        method: 'PATCH',
      });
      expect(error).to.not.have.property('statusCode');
      expect(error.body).to.deep.equal({ message: 'Invalid GAR' });
    });

    it('distinguishes network failures from configured timeouts and has no implicit timeout', async () => {
      const networkFetch = sinon.stub().rejects(new TypeError('connection refused'));
      global.fetch = networkFetch;
      const defaultClient = new HttpClient({ baseUrl: 'https://api.example.test' });
      const networkError = await rejected(defaultClient.get('/offline'));

      expect(networkError).to.be.instanceOf(Error);
      expect(networkError.type).to.equal('network_error');
      expect(networkFetch.firstCall.args[1]).to.not.have.property('signal');

      const clock = sinon.useFakeTimers();
      try {
        global.fetch = (_url, { signal }) =>
          new Promise((_resolve, reject) => {
            signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')), { once: true });
          });
        const timeoutClient = new HttpClient({ baseUrl: 'https://api.example.test', timeout: 25 });
        const timeoutErrorPromise = rejected(timeoutClient.get('/slow'));
        await clock.tickAsync(25);
        const timeoutError = await timeoutErrorPromise;

        expect(timeoutError).to.be.instanceOf(Error);
        expect(timeoutError.type).to.equal('timeout_error');
        expect(timeoutError.url).to.equal('https://api.example.test/slow');
        expect(clock.countTimers()).to.equal(0);
      } finally {
        clock.restore();
      }
    });

    it('uses a per-request timeout override and lets caller aborts remain distinct', async () => {
      const clock = sinon.useFakeTimers();
      try {
        global.fetch = (_url, { signal }) =>
          new Promise((_resolve, reject) => {
            signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')), { once: true });
          });
        const client = new HttpClient({ baseUrl: 'https://api.example.test', timeout: 100 });
        const timeoutErrorPromise = rejected(client.get('/override', { timeout: 10 }));
        await clock.tickAsync(10);
        const timeoutError = await timeoutErrorPromise;

        expect(timeoutError.type).to.equal('timeout_error');
        expect(clock.countTimers()).to.equal(0);

        const controller = new AbortController();
        const callerRequest = client.get('/cancelled', { timeout: null, signal: controller.signal });
        const abortErrorPromise = rejected(callerRequest);
        controller.abort();
        const abortError = await abortErrorPromise;
        expect(abortError.type).to.equal('abort_error');
      } finally {
        clock.restore();
      }
    });

    it('removes caller-signal listeners when a request completes', async () => {
      const signal = {
        aborted: false,
        reason: undefined,
        addEventListener: sinon.spy(),
        removeEventListener: sinon.spy(),
      };
      global.fetch = sinon.stub().resolves(response({ body: { accepted: true } }));
      const client = new HttpClient({ baseUrl: 'https://api.example.test', timeout: 1000 });

      await client.get('/fast', { signal });

      expect(signal.addEventListener).to.have.been.calledOnce;
      expect(signal.removeEventListener).to.have.been.calledOnceWithExactly(
        'abort',
        signal.addEventListener.firstCall.args[1]
      );
    });

    it('does not retry failed requests', async () => {
      const fetchStub = sinon.stub().rejects(new TypeError('connection refused'));
      global.fetch = fetchStub;
      const client = new HttpClient({ baseUrl: 'https://api.example.test' });

      await rejected(client.get('/offline'));

      expect(fetchStub).to.have.been.calledOnce;
    });
  });
});
