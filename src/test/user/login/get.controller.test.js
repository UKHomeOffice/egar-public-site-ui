/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */

const sinon = require('sinon');
const { expect } = require('chai');
const chai = require('chai');
const sinonChai = require('sinon-chai');

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
    };
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should render the appropriate page', async () => {
    const cookie = new CookieModel(req);
    await controller(req, res);

    expect(res.redirect).to.not.have.been.called;
    expect(res.render).to.have.been.calledOnceWithExactly('app/user/login/index', { cookie });
  });

  it('should render if referer but no user object in session', async () => {
    req.headers.referer = '/example';
    const cookie = new CookieModel(req);
    delete req.session.u;
    await controller(req, res);

    expect(res.redirect).to.not.have.been.called;
    expect(res.render).to.have.been.calledOnceWithExactly('app/user/login/index', { cookie });
  });

  it('should render if referer but no dbId in session', async () => {
    req.headers.referer = '/example';
    req.session.u = {};
    const cookie = new CookieModel(req);
    await controller(req, res);

    expect(res.redirect).to.not.have.been.called;
    expect(res.render).to.have.been.calledOnceWithExactly('app/user/login/index', { cookie });
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
    expect(res.render).to.have.been.calledOnceWithExactly('app/user/login/index', { cookie });
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
    expect(res.render).to.have.been.calledOnceWithExactly('app/user/login/index', { cookie });
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
    expect(res.render).to.have.been.calledOnceWithExactly('app/user/login/index', { cookie });
  });

  it('should redirect if there is a referrer and dbId, role and verified set in the cookie', async () => {
    req.headers.referer = '/example';
    req.session.u = {
      dbId: 'ALREADY_LOGGED_IN_ID',
      rl: 'User',
      vr: true,
    };

    await controller(req, res);

    expect(res.redirect).to.have.been.calledOnceWithExactly('/home');
    expect(res.render).to.not.have.been.called;
  });
});
