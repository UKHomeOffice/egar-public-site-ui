/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */

const sinon = require('sinon');
const { expect } = require('chai');
const chai = require('chai');
const sinonChai = require('sinon-chai');
const config = require('../../../common/config/index');


require('../../global.test');
const CookieModel = require('../../../common/models/Cookie.class');

const controller = require('../../../app/user/login/get.controller');

describe('User Login Get Controller', () => {
  let req; let res;

  beforeEach(() => {
    chai.use(sinonChai);

    req = {
      headers: {},
      session: {},
    };

    res = {
      redirect: sinon.spy(),
      render: sinon.spy(),
      cookie: ()=>(true)
    };

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
    config.ONE_LOGIN_CLIENT_ID="test_client_id";
    config.ONE_LOGIN_INTEGRATION_URL="www.test_one_login.com"

  });

  afterEach(() => {
    sinon.restore();
  });

  it('should render the appropriate page', async () => {
    const cookie = new CookieModel(req);
    await controller(req, res);
    
    expect(res.render).to.have.been.calledOnceWith('app/user/login/index', sinon.match((arg) => {
      return JSON.stringify(arg.cookie)===JSON.stringify(cookie) && arg.oneLoginAuthUrl.length > 0;
    }));
  });

  it('should render if referer but no user object in session', async () => {
    req.headers.referer = '/example';
    const cookie = new CookieModel(req);
    delete req.session.u;
    await controller(req, res);

    expect(res.redirect).to.not.have.been.called;
    expect(res.render).to.have.been.calledOnceWith('app/user/login/index', sinon.match((arg) => {
      return JSON.stringify(arg.cookie)===JSON.stringify(cookie) && arg.oneLoginAuthUrl.length > 0;
    }));
  });

  it('should render if referer but no dbId in session', async () => {
    req.headers.referer = '/example';
    req.session.u = {};
    const cookie = new CookieModel(req);
    await controller(req, res);

    expect(res.redirect).to.not.have.been.called;
    expect(res.render).to.have.been.calledOnceWith('app/user/login/index', sinon.match((arg) => {
      return JSON.stringify(arg.cookie)===JSON.stringify(cookie) && arg.oneLoginAuthUrl.length > 0;
    }));
  });

  it('should render if referer but no role in session', async () => {
    req.headers.referer = '/example';
    req.session.u = {
      dbId: 'ALREADY_LOGGED_IN_ID',
      vr: true,
    };
    const cookie = new CookieModel(req);
    await controller(req, res);

    expect(res.redirect).to.not.have.been.called;
    expect(res.render).to.have.been.calledOnceWith('app/user/login/index', sinon.match((arg) => {
      return JSON.stringify(arg.cookie)===JSON.stringify(cookie) && arg.oneLoginAuthUrl.length > 0;
    }));
  });

  it('should render if referer but no verified in session', async () => {
    req.headers.referer = '/example';
    req.session.u = {
      dbId: 'ALREADY_LOGGED_IN_ID',
      rl: 'User',
    };
    const cookie = new CookieModel(req);
    await controller(req, res);

    expect(res.redirect).to.not.have.been.called;
    expect(res.render).to.have.been.calledOnceWith('app/user/login/index', sinon.match((arg) => {
      return JSON.stringify(arg.cookie)===JSON.stringify(cookie) && arg.oneLoginAuthUrl.length > 0;
    }));
  });

  it('should render if referer but unverified in session', async () => {
    req.headers.referer = '/example';
    req.session.u = {
      dbId: 'ALREADY_LOGGED_IN_ID',
      vr: false,
      rl: 'User',
    };
    const cookie = new CookieModel(req);
    await controller(req, res);

    expect(res.redirect).to.not.have.been.called;
    expect(res.render).to.have.been.calledOnceWith('app/user/login/index', sinon.match((arg) => {
      return JSON.stringify(arg.cookie)===JSON.stringify(cookie) && arg.oneLoginAuthUrl.length > 0;
    }));
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
      const cookie = new CookieModel(req);
      await controller(req, res);
      
      expect(res.render).to.have.been.calledOnceWith('app/user/login/index', sinon.match((arg) => {
        return arg.oneLoginAuthUrl.includes(config.ONE_LOGIN_CLIENT_ID) && arg.oneLoginAuthUrl.includes(config.ONE_LOGIN_INTEGRATION_URL);
      }));
    });
});
