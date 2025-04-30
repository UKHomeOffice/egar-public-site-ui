/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */

const sinon = require('sinon');
const {expect} = require('chai');
const chai = require('chai');
const sinonChai = require('sinon-chai');
const config = require('../../../common/config/index');
const oneLoginUtils = require('../../../common/utils/oneLoginAuth');
const oneLoginApi = require('../../../common/services/oneLoginApi');
const userApi = require('../../../common/services/userManageApi');


require('../../global.test');
const CookieModel = require('../../../common/models/Cookie.class');

const controller = require('../../../app/user/login/get.controller');

describe('User Login Get Controller', () => {
  let req;
  let res;
  let oneLoginUrlStub;
  let oneLoginJwtVerifyStub;
  let sendOneLoginTokenRequestStub;
  let getUserInfoFromOneLogin;
  let userSearchStub;
  let updateUserData;


  beforeEach(() => {
    chai.use(sinonChai);

    req = {
      headers: {},
      session: {
        reload: sinon.spy(),
      },
    };

    res = {
      redirect: sinon.spy(),
      render: sinon.spy(),
      cookie: () => true
    };

    oneLoginUrlStub = sinon.stub(oneLoginUtils, 'getOneLoginAuthUrl')
      .returns("https://onelogin_url?code=123&state=valid_state");

    // Add the stub for sendOneLoginTokenRequest
    sendOneLoginTokenRequestStub = sinon.stub(oneLoginApi, 'sendOneLoginTokenRequest')
      .resolves({
        access_token: 'mock_access_token',
        id_token: 'mock_id_token'
      });

    getUserInfoFromOneLogin = sinon.stub(oneLoginApi, 'getUserInfoFromOneLogin')
      .resolves({
        email_verified: true,
        email: 'user@email.com',
        sub: 'onelogin_sid',
      })

    userSearchStub = sinon.stub(userApi, 'userSearch')
    updateUserData = sinon.stub(userApi, 'updateDetails')
    oneLoginJwtVerifyStub = sinon.stub(oneLoginUtils, 'verifyJwt').callsFake((idToken, nonce, callback) => {
      callback(true); // Simulate successful JWT verification
    });


    //Generated just for unit testing, not used anywhere
    config.ONE_LOGIN_PRIVATE_KEY = `-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCjX0S40TlB9qw+
Fp0sbtQroHmFqGgTUoZjjI3kX1YF5BP36Y41U7QL4ZjStDVfOfdTMNw9I43NMScZ
29i0UpL1XC8rnTj4GW4JIAiDrGWr4Zmh5HlOTHffqNPGf0jmrjBTtFE3m7tbhC6P
yKN2uUw/7vXe0nAIz7am6nMdhd8jdY06KC5rZfilKJWGZ1W9tnbU4/X7O45wgJZ4
Xv0eVFsFbGCUNfhG7lmQMO+TOmHwyjCzxHiGKQsCGhV/ZEs+BurdmStaHr/1dd+C
VKhk2JKSqAUgME1d65UrcmJfvBs4SPjLgwZ2nFp/51vPWJlPd0s5EqSHYsz3I9sj
WGfygB8rAgMBAAECggEADq9qmv5bmj1VIEOiHzNbKQzEv6nyqQH7CInC22tibSci
UF+TI+IBRiwiM5Z1UbkBLV4v/eLrRS2M6Tsk0Ji3kwyVRONeEpcel/1kJonhncCq
sa265bnj8JvZZXddkzbHK08DGe+KuOA52zzazLo9S2XsffoGjhQ1w+1BKb813pb2
fBiheaofLPkSnWoZhit+lXgrCrQQQzRPISl/oOZAVC7w5JgPuYS0ATxWCcfKZFT0
C5tqMND2LuU4pn14xRrXmE9rwxjCkDi4Sn+YuZDsDafKfVRhgPV3hg7OGsoJiV0m
IcUKqHifwGxZc/Grwq5GGRg/y05CkDrNu4UihVUusQKBgQDkcCBILrp1f2jwIvjA
Tprczbx/W1Tu+0Tspb1ENB5mbZWXR41q1DcIposepgcuIbdnjtzl6xXaEFVGKbLb
YhzT23JjqUZ7eCXSc0iP4SytJJrTbsEsi3c1TbX7T4Z32BiZvRbSiegMoTioKW4P
OI0xNw4RdKqV/sW+b88F0LCTiQKBgQC3FWwVl2FiEr9cGafnr0qs47RpriZf3rg8
0HmfFawPK1xd+6h+xzg6RlMmktGXqmzEVvIvTGmrPHPIstB0DJokxwHLtbBu3CpD
7zLkcmQqrIE3NPAc+7IayqT5AbBjN5I2g+ukGyWKiFSqgnNaJGJl0qK3VboAirY+
JgF+iDTMEwKBgGZr/41dpixYW+yPQYi3taeadxGDGams71JLXXjfBWJXb+LMKhPj
4mj2gxnSxxVf+KNt4o0TwlBrUlCLEa5bZyF2GuukUf25+PtKxRX9l9JpvyFdXy9h
uKkllpp/JYNGWIFVzo3HV0uSXZzINpiMeoG+dYhODs4B1Rd1ehTZZNJBAoGAXccy
Ssj0j8isjh9yGsF2DaLBCZSzgU3SrwvWED+Il2iNcnJyNyYSTf8xnkN76iTYe6VR
fhq00YowgG/fSGIgHpB1AgQ5sD9DwvJl7hAN8LHVqhKKnz3pV8HOyOEtmVSgpx3h
eHiTPSdhvsj9DwIuCJvgzumxUY+7k4/iGg7ohFMCgYEAnd/vLV+flv5Lu0yi9d2k
+igg3IJ7lRR/vDvYOYSj/dOSUlC9FDPtx2eE4qVu6KSi8ObEiFY19NKJsul7waa/
7oEczCmdpLiikYVd2C2+346Tl8HIUWw0a3KcZx7KrjhD0CUu6QVTIyExmkK+3KSo
FnBdx5XR9zLe40LX3+cbEtw=
-----END PRIVATE KEY-----`;
    config.ONE_LOGIN_CLIENT_ID = "test_client_id";
    config.ONE_LOGIN_INTEGRATION_URL = "www.test_one_login.com"

  });

  afterEach(() => {
    sinon.restore();
  });


  it('should render if referer but no user object in session', async () => {
    req.headers.referer = '/example';
    req.query = {}
    req.cookies = {}

    await controller(req, res);

    expect(res.redirect).to.not.have.been.called;

    // Verify that the render method was called with the correct arguments
    expect(res.render).to.have.been.calledOnceWith('app/user/login/index', sinon.match({
      oneLoginAuthUrl: "https://onelogin_url?code=123&state=valid_state"
    }));
  });

  it('should redirect to /home when user details are complete in session', async () => {
    // Setup request with referer and complete user session
    req.headers.referer = '/example';
    req.session.u = {
      dbId: 'USER_ID',
      vr: true,  // verified
      rl: 'User', // role
    };

    // Execute controller
    await controller(req, res);

    // Verified user is redirected to /home
    expect(res.redirect).to.have.been.calledOnceWith('/home');
    expect(res.render).to.not.have.been.called;
  });

  it('should update user details with OneLogin SID and redirect to home', async () => {
    // Setup
    req.query = {
      code: '123',
      state: 'valid_state'
    };

    req.cookies = {
      state: 'valid_state',
      nonce: 'valid_nonce'
    };

    // Mock user info from OneLogin
    getUserInfoFromOneLogin.resolves({
      email_verified: true,
      email: 'test@example.com',
      sub: 'onelogin_sid'
    });

    // Mock user search response with a verified user who doesn't have a OneLogin SID yet
    userSearchStub.resolves({
      userId: 'test_user_id',
      state: 'verified',
      oneLoginSid: null, // This will trigger the updateDetails call
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      role: {name: 'User'}
    });

    // Mock getDetails to return a valid organization
    sinon.stub(userApi, 'getDetails').resolves({
      organisation: {organisationId: 'org123'}
    });

    // Execute
    await controller(req, res);

    // Verify updateDetails was called with the correct parameters
    expect(updateUserData).to.have.been.calledWith(
      'test@example.com',
      'Test',
      'User',
      'onelogin_sid'
    );

    expect(res.redirect).to.have.been.calledOnceWith('/home');
    expect(res.render).to.not.have.been.called;
  });

  it('should render if error page if user organisation not found', async () => {
    // Setup
    req.query = {
      code: '123',
      state: 'valid_state'
    };

    req.cookies = {
      state: 'valid_state',
      nonce: 'valid_nonce'
    };


    // Mock user info from OneLogin
    getUserInfoFromOneLogin.resolves({
      email_verified: true,
      email: 'test@example.com',
      sub: 'onelogin_sid'
    });

    // Mock user search response with a verified user
    userSearchStub.resolves({
      userId: 'test_user_id',
      state: 'verified',
      oneLoginSid: null,
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      role: {name: 'User'}
    });

    // Mock getDetails to return null for organisation, simulating the error condition
    const getDetailsStub = sinon.stub(userApi, 'getDetails').resolves({
      organisation: null
    });

    // Execute
    await controller(req, res);

    // Verify
    expect(sendOneLoginTokenRequestStub).to.have.been.calledOnceWith('123');
    expect(getUserInfoFromOneLogin).to.have.been.calledWith('mock_access_token');
    expect(userSearchStub).to.have.been.calledWith('test@example.com', 'onelogin_sid');
    expect(getDetailsStub).to.have.been.calledWith('test@example.com');

    // The controller should redirect to the error page
    expect(res.redirect).to.have.been.calledOnceWith('/error/404');
    expect(res.render).to.not.have.been.called;

  });

  it('should render error page if user email not verified', async () => {
    req.headers.referer = '/example';

    req.session.u = {
      dbId: 'ALREADY_LOGGED_IN_ID',
      vr: false,
      rl: 'User',
    };

    req.query = {
      state: 'valid_state',
      code: '123',
    }

    req.cookies = {
      state: 'valid_state', // Matching state
      nonce: 'valid_nonce'
    };

    userSearchStub.resolves({
      userId: 'test_user_id',
      email: 'user@email.com',
      state: 'unverified',
      role: 'Admin'
    });

    // const cookie = new CookieModel(req);
    await controller(req, res);

    expect(sendOneLoginTokenRequestStub).to.have.been.calledOnceWith('123');

    expect(res.redirect).to.have.been.calledWith('/error/404');
  });

  it('should redirect if there is a referrer and dbId, role and verified set in the cookie', async () => {
    req.headers.referer = '/example';
    req.session.u = {
      dbId: 'ALREADY_LOGGED_IN_ID',
      rl: 'User',
      vr: true,
    };

    await controller(req, res);

    expect(res.redirect).to.have.been.calledOnceWith('/home');
    expect(res.render).to.not.have.been.called;
  });

  it('should include a valid one login url', async () => {
    req.query = {}

    await controller(req, res);

    // Verify that oneLoginUtils.getOneLoginAuthUrl was called with res
    expect(oneLoginUrlStub).to.have.been.calledOnceWith(res);

    // Verify that the render method was called with the correct arguments
    expect(res.render).to.have.been.calledOnceWith('app/user/login/index', sinon.match({
      oneLoginAuthUrl: "https://onelogin_url?code=123&state=valid_state"
    }));
  });

  it('should redirect to error page if state in query does not match state in cookies', async () => {
    // Setup
    req.query = {
      code: '123',
      state: 'invalid_state' // Different from cookie state
    };

    req.cookies = {
      state: 'valid_state',
      nonce: 'valid_nonce'
    };

    // Execute controller
    await controller(req, res);

    // Verify redirect to error page
    expect(res.redirect).to.have.been.calledOnceWith('/error/404');
    expect(res.render).to.not.have.been.called;
  });

  it('should render login page if JWT verification fails', async () => {
    // Setup
    req.query = {
      code: '123',
      state: 'valid_state',
    };

    req.cookies = {
      state: 'valid_state',
      nonce: 'valid_nonce'
    };

    oneLoginJwtVerifyStub.callsFake((idToken, nonce, callback) => {
      callback(false);
    });

    oneLoginUrlStub.returns("https://onelogin_url?code=123&state=valid_state");

    sendOneLoginTokenRequestStub.resolves({
      access_token: 'mock_access_token',
      id_token: 'mock_id_token'
    });

    // Execute controller
    await controller(req, res);

    // Verify that the login page is rendered
    expect(res.render).to.have.been.calledWith('app/user/login/index', {
      oneLoginAuthUrl: "https://onelogin_url?code=123&state=valid_state"
    });

  });

  it('should render login page if user email is not verified in OneLogin', async () => {
    // Setup
    req.query = {
      code: '123',
      state: 'valid_state'
    };

    req.cookies = {
      state: 'valid_state',
      nonce: 'valid_nonce'
    };

    // Restore the original stubs
    sinon.restore();

    // Create stubs for the test
    sinon.stub(oneLoginUtils, 'verifyJwt').callsFake((idToken, nonce, callback) => {
      callback(true); // Simulate successful JWT verification
    });

    oneLoginUrlStub = sinon.stub(oneLoginUtils, 'getOneLoginAuthUrl')
      .returns("https://onelogin_url?code=123&state=valid_state");

    sendOneLoginTokenRequestStub = sinon.stub(oneLoginApi, 'sendOneLoginTokenRequest')
      .resolves({
        access_token: 'mock_access_token',
        id_token: 'mock_id_token'
      });

    // Mock user info from OneLogin with email_verified set to false
    getUserInfoFromOneLogin = sinon.stub(oneLoginApi, 'getUserInfoFromOneLogin')
      .resolves({
        email_verified: false, // Email not verified
        email: 'test@example.com',
        sub: 'onelogin_sid'
      });

    // Execute controller
    await controller(req, res);

    // Verify that the login page is rendered
    expect(res.redirect).to.have.been.calledWith('/error/404');
  });

  it('should redirect to /onelogin/register if user cannot be found from userApi.search', async () => {
    // Setup
    req.query = {
      code: '123',
      state: 'valid_state'
    };

    req.cookies = {
      state: 'valid_state',
      nonce: 'valid_nonce'
    };

    // Restore the original stubs
    sinon.restore();

    // Create stubs for the test
    sinon.stub(oneLoginUtils, 'verifyJwt').callsFake((idToken, nonce, callback) => {
      callback(true); // Simulate successful JWT verification
    });

    oneLoginUrlStub = sinon.stub(oneLoginUtils, 'getOneLoginAuthUrl')
      .returns("https://onelogin_url?code=123&state=valid_state");

    sendOneLoginTokenRequestStub = sinon.stub(oneLoginApi, 'sendOneLoginTokenRequest')
      .resolves({
        access_token: 'mock_access_token',
        id_token: 'mock_id_token'
      });

    // Mock user info from OneLogin with email_verified set to true
    getUserInfoFromOneLogin = sinon.stub(oneLoginApi, 'getUserInfoFromOneLogin')
      .resolves({
        email_verified: true,
        email: 'test@example.com',
        sub: 'onelogin_sid'
      });

    // Mock userApi.userSearch to return a result indicating no user was found
    userSearchStub = sinon.stub(userApi, 'userSearch').resolves({
      userId: null, // No user ID indicates user not found
      state: null,
      oneLoginSid: null,
      email: null,
      firstName: null,
      lastName: null,
      role: null
    });

    // Execute controller
    await controller(req, res);

    // Verify that the controller redirects to /user/register
    expect(res.redirect).to.have.been.calledOnceWith('/onelogin/register');
    expect(res.render).to.not.have.been.called;
  });
});
