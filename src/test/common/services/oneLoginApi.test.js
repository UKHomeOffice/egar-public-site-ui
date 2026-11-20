const { expect } = require('chai');
const sinon = require('sinon');

require('../../global.test');

const config = require('../../../common/config');
const oneLoginApi = require('../../../common/services/oneLoginApi');
const { correlationIdMiddleware } = require('../../../common/utils/correlationContext');

function response({ status = 200, statusText = 'OK', body } = {}) {
  return {
    status,
    ok: status >= 200 && status < 300,
    statusText,
    headers: { get: () => 'application/json' },
    text: async () => JSON.stringify(body),
  };
}

function inCorrelationContext(callback) {
  return new Promise((resolve, reject) => {
    correlationIdMiddleware({}, { setHeader: () => {} }, () => callback().then(resolve, reject));
  });
}

describe('One Login API', () => {
  let originalFetch;
  let originalIntegrationUrl;
  let originalClientId;
  let originalRedirectUri;

  beforeEach(() => {
    originalFetch = global.fetch;
    originalIntegrationUrl = config.ONE_LOGIN_INTEGRATION_URL;
    originalClientId = config.ONE_LOGIN_CLIENT_ID;
    originalRedirectUri = config.ONE_LOGIN_REDIRECT_URI;
    config.ONE_LOGIN_INTEGRATION_URL = 'https://one-login.example.test';
    config.ONE_LOGIN_CLIENT_ID = 'public-site-client';
    config.ONE_LOGIN_REDIRECT_URI = 'https://public-site.example.test/callback';
  });

  afterEach(() => {
    global.fetch = originalFetch;
    config.ONE_LOGIN_INTEGRATION_URL = originalIntegrationUrl;
    config.ONE_LOGIN_CLIENT_ID = originalClientId;
    config.ONE_LOGIN_REDIRECT_URI = originalRedirectUri;
    sinon.restore();
  });

  it('exchanges the authorization code with the existing JWT assertion and redirect URI', async () => {
    const tokenResponse = { access_token: 'access-token', id_token: 'id-token' };
    const fetchStub = sinon.stub().resolves(response({ body: tokenResponse }));
    global.fetch = fetchStub;
    const jwtParams = {};
    const oneLoginUtil = {
      createJwt: sinon.stub().callsFake((params) => {
        Object.assign(jwtParams, params);
        return 'client-assertion';
      }),
    };
    const req = { get: () => 'public-site.dev.internal.egar-notprod.homeoffice.gov.uk' };

    const result = await inCorrelationContext(() =>
      oneLoginApi.sendOneLoginTokenRequest(req, 'code & value', oneLoginUtil)
    );

    const [url, options] = fetchStub.firstCall.args;
    const params = new URLSearchParams(options.body);
    const expectedRedirectUri = oneLoginApi.parseUrlForNonProd(req, config.ONE_LOGIN_REDIRECT_URI);

    expect(result).to.deep.equal(tokenResponse);
    expect(url.href).to.equal('https://one-login.example.test/token');
    expect(options.method).to.equal('POST');
    expect(options.redirect).to.equal('error');
    expect(options.headers['Content-Type']).to.equal('application/x-www-form-urlencoded');
    expect(params.get('grant_type')).to.equal('authorization_code');
    expect(params.get('code')).to.equal('code & value');
    expect(params.get('redirect_uri')).to.equal(expectedRedirectUri);
    expect(params.get('client_assertion_type')).to.equal('urn:ietf:params:oauth:client-assertion-type:jwt-bearer');
    expect(params.get('client_assertion')).to.equal('client-assertion');
    expect(jwtParams).to.include({
      aud: 'https://one-login.example.test/token',
      iss: 'public-site-client',
      sub: 'public-site-client',
    });
    expect(jwtParams.exp - jwtParams.iat).to.equal(300);
    expect(options.headers['X-Correlation-ID']).to.be.a('string');
  });

  it('retrieves user info with bearer authorization on the restricted One Login origin', async () => {
    const userInfo = { email: 'user@example.test', sub: 'one-login-subject' };
    const fetchStub = sinon.stub().resolves(response({ body: userInfo }));
    global.fetch = fetchStub;

    const result = await inCorrelationContext(() => oneLoginApi.getUserInfoFromOneLogin('user-access-token'));

    const [url, options] = fetchStub.firstCall.args;
    expect(result).to.deep.equal(userInfo);
    expect(url.href).to.equal('https://one-login.example.test/userinfo');
    expect(options.method).to.equal('GET');
    expect(options.headers.Authorization).to.equal('Bearer user-access-token');
    expect(options.redirect).to.equal('error');
    expect(options.headers['X-Correlation-ID']).to.be.a('string');
  });

  it('returns One Login error response bodies as before for token and user-info requests', async () => {
    const tokenError = { error: 'invalid_grant' };
    const userInfoError = { error: 'invalid_token' };
    global.fetch = sinon
      .stub()
      .onFirstCall()
      .resolves(response({ status: 400, body: tokenError }));
    global.fetch.onSecondCall().resolves(response({ status: 401, body: userInfoError }));

    const req = { get: () => 'public-site.example.test' };
    const tokenResult = await oneLoginApi.sendOneLoginTokenRequest(req, 'expired-code', {
      createJwt: () => 'assertion',
    });
    const userInfoResult = await oneLoginApi.getUserInfoFromOneLogin('expired-token');

    expect(tokenResult).to.deep.equal(tokenError);
    expect(userInfoResult).to.deep.equal(userInfoError);
  });

  it('rejects network failures instead of fabricating a successful response', async () => {
    const networkError = new TypeError('connection refused');
    global.fetch = sinon.stub().rejects(networkError);

    const error = await oneLoginApi.getUserInfoFromOneLogin('user-access-token').then(
      () => {
        throw new Error('Expected One Login request to reject');
      },
      (requestError) => requestError
    );

    expect(error).to.include({
      name: 'NetworkError',
      type: 'network_error',
      message: 'connection refused',
    });
  });
});
