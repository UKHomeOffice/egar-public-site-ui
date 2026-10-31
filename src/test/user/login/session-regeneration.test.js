const sinon = require('sinon');
const { expect } = require('chai');
const chai = require('chai');
const sinonChai = require('sinon-chai');
const proxyquire = require('proxyquire').noCallThru();
const { sessionRegenerateForAuthenticatedUser } = require('../../../common/utils/session_generator');
const config = require('../../../common/config/index');
const oneLoginUtils = require('../../../common/utils/oneLoginAuth');
const oneLoginApi = require('../../../common/services/oneLoginApi');
const { userManageApi: userApi } = require('../../../common/services/dataAccessApi');

require('../../global.test');

const controller = require('../../../app/user/login/get.controller');

function createLoginRequest() {
  return {
    headers: {},
    query: {
      code: 'valid_code',
      state: 'valid_state',
    },
    cookies: {
      state: 'valid_state',
      nonce: 'valid_nonce',
    },
    get: sinon.stub().withArgs('host').returns('public-site.dev.egar-notprod.homeoffice.gov.uk'),
    session: {
      redirectUrl: '/garfile/home?gar_id=GAR-123',
      save: sinon.spy(),
    },
  };
}

function createLoginResponse() {
  return {
    redirect: sinon.spy(),
    render: sinon.spy(),
    cookie: sinon.spy(),
    clearCookie: sinon.spy(),
    set: sinon.spy(),
  };
}

describe('Login Session Regeneration', () => {
  beforeEach(() => {
    chai.use(sinonChai);
  });

  afterEach(() => {
    sinon.restore();
  });

  it('regenerates session and migrates non-cookie state', async () => {
    const req = {
      session: {
        redirectUrl: '/garfile/home?gar_id=GAR-123',
        cookie: { maxAge: 60000 },
      },
    };

    const regenerateStub = sinon.stub().callsFake((callback) => {
      req.session = { save: sinon.spy() };
      callback();
    });

    req.session.regenerate = regenerateStub;

    const result = await sessionRegenerateForAuthenticatedUser(req);

    expect(result).to.equal(true);
    expect(regenerateStub).to.have.been.calledOnce;
    expect(req.session.redirectUrl).to.equal('/garfile/home?gar_id=GAR-123');
    expect(req.session.cookie).to.be.undefined;
  });

  it('rotates session ID on successful login and keeps auth state in the new session', async () => {
    const req = createLoginRequest();

    const regenerateStub = sinon.stub().callsFake((callback) => {
      req.session = {
        save: sinon.spy(),
      };
      callback();
    });

    req.session.regenerate = regenerateStub;

    const res = createLoginResponse();

    sinon.stub(oneLoginApi, 'sendOneLoginTokenRequest').resolves({
      access_token: 'mock_access_token',
      id_token: 'mock_id_token',
    });

    sinon.stub(oneLoginUtils, 'verifyJwt').callsFake((_idToken, _nonce, callback) => {
      callback(true);
    });

    sinon.stub(oneLoginApi, 'getUserInfoFromOneLogin').resolves({
      email_verified: true,
      email: 'user@email.com',
      sub: 'onelogin_sid',
    });

    sinon.stub(userApi, 'userSearch').resolves({
      userId: 'USER-DB-ID-1',
      state: 'verified',
      oneLoginSid: 'onelogin_sid',
      email: 'user@email.com',
      firstName: 'Ada',
      lastName: 'Lovelace',
      role: { name: 'Individual' },
    });

    sinon.stub(userApi, 'getDetails').resolves({
      organisation: { organisationId: 'ORG-1', organisationName: 'Org Name' },
    });

    await controller(req, res);

    expect(regenerateStub).to.have.been.calledOnce;
    expect(req.session.redirectUrl).to.equal('/garfile/home?gar_id=GAR-123');
    expect(req.session.u.dbId).to.equal('USER-DB-ID-1');
    expect(req.session.u.vr).to.equal(true);
    expect(req.session.u.rl).to.equal('Individual');
    expect(res.redirect).to.have.been.calledOnceWith('/garfile/home?gar_id=GAR-123');
  });

  it('should redirect to service error path when session regeneration return false', async () => {
    config.ONE_LOGIN_INTEGRATION_URL = 'https://onelogin.example';
    config.ONE_LOGIN_LOGOUT_URL = 'https://app/onelogin/logout';

    const sessionRegenerateStub = sinon.stub().resolves(false);
    const controllerWithFailedRegeneration = proxyquire('../../../app/user/login/get.controller', {
      '../../../common/utils/session_generator': {
        sessionRegenerateForAuthenticatedUser: sessionRegenerateStub,
      },
    });

    const req = createLoginRequest();
    req.session.redirectUrl = '';
    const res = createLoginResponse();

    const userSearchStub = sinon.stub(userApi, 'userSearch');

    sinon.stub(oneLoginApi, 'sendOneLoginTokenRequest').resolves({
      access_token: 'mock_access_token',
      id_token: 'mock_id_token',
    });

    sinon.stub(oneLoginUtils, 'verifyJwt').callsFake((_idToken, _nonce, callback) => {
      callback(true);
    });

    sinon.stub(oneLoginApi, 'getUserInfoFromOneLogin').resolves({
      email_verified: true,
      email: 'user@email.com',
      sub: 'onelogin_sid',
    });

    await controllerWithFailedRegeneration(req, res);

    expect(sessionRegenerateStub).to.have.been.calledOnce;
    expect(userSearchStub).to.not.have.been.called;
    expect(res.redirect).to.have.been.calledOnce;
    expect(res.redirect.firstCall.args[0]).to.contain('/logout?');
  });
});
