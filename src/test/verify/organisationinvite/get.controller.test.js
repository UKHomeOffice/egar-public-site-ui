const sinon = require('sinon');
const { expect } = require('chai');
const chai = require('chai');
const sinonChai = require('sinon-chai');

require('../../global.test');
const CookieModel = require('../../../common/models/Cookie.class');
const tokenService = require('../../../common/services/create-token');

const oneLoginUtils = require('../../../common/utils/oneLoginAuth');
const controller = require('../../../app/verify/organisationinvite/get.controller');
const { verificationApi: verifyUserService } = require('../../../common/services/dataAccessApi');

describe('Verify Organisation Invite Get Controller', () => {
  let req;
  let res;
  const oneLoginAuthUrl = 'https://onelogin?code=123&state=state';
  let verifyUserServiceStub;

  beforeEach(() => {
    chai.use(sinonChai);
    req = {
      session: {},
      query: {
        query: 'Example Incoming Unhashed Token',
      },
      get: sinon.stub().returns('stubbed-header'),
    };

    res = {
      render: sinon.spy(),
      cookie: sinon.stub(),
      redirect: sinon.stub(),
    };
    sinon.stub(tokenService, 'generateHash').returns('HashedToken123');
    sinon.stub(oneLoginUtils, 'getOneLoginAuthUrl').returns(oneLoginAuthUrl);
    verifyUserServiceStub = sinon.stub(verifyUserService, 'getUserInviteTokenByTokenId');
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should clear the cookie and set a hashed token before render', async () => {
    req.session.u = { dbId: 'old-user' };
    verifyUserServiceStub.resolves({ tokenId: 'HashedToken123' });
    await controller(req, res);

    expect(tokenService.generateHash).to.have.been.calledOnceWithExactly('Example Incoming Unhashed Token');
    expect(verifyUserServiceStub).to.have.been.calledOnceWithExactly('HashedToken123');
    expect(new CookieModel(req).getInviteUserToken()).to.eq('HashedToken123');
    expect(new CookieModel(req).getUserDbId()).not.to.exist;
    expect(res.redirect).not.to.have.been.called;
    expect(res.render).to.have.been.calledOnceWithExactly('app/verify/organisationinvite/index', {
      oneLoginAuthUrl,
    });
  });

  ['Token expired', 'Token already used'].forEach((message) => {
    it(`redirects to the expired-invite page for HTTP 400 ${message}`, async () => {
      verifyUserServiceStub.rejects(
        Object.assign(new Error('Bad Request'), {
          type: 'http_error',
          status: 400,
          body: { message },
        })
      );

      await controller(req, res);

      expect(res.redirect).to.have.been.calledOnceWithExactly('/error/inviteExpiredError');
      expect(res.render).not.to.have.been.called;
    });
  });

  [
    ['http_error', 400, { message: 'No token found for user' }],
    ['http_error', 503, { message: 'Token expired' }],
    ['network_error', undefined, undefined],
  ].forEach(([type, status, body]) => {
    it(`redirects to the error page on ${type} ${status || ''}`, async () => {
      verifyUserServiceStub.rejects(Object.assign(new Error('Request failed'), { type, status, body }));

      await controller(req, res);

      expect(res.redirect).to.have.been.calledOnceWithExactly('/error/404');
      expect(res.render).not.to.have.been.called;
    });
  });
});
