const sinon = require('sinon');
const { expect } = require('chai');
const chai = require('chai');
const sinonChai = require('sinon-chai');

require('../../global.test');
const CookieModel = require('../../../common/models/Cookie.class');
const tokenService = require('../../../common/services/create-token');

const oneLoginUtils = require('../../../common/utils/oneLoginAuth');
const controller = require('../../../app/verify/organisationinvite/get.controller');
const settings = require('../../../common/config/index');
const verifyUserService = require('../../../common/services/verificationApi');

describe('Verify Organisation Invite Get Controller', () => {
  let req;
  let res;
  let oneLoginUrlStub;
  const oneLoginAuthUrl =
    settings.ONE_LOGIN_SHOW_ONE_LOGIN === true ? 'https://onelogin?code=123&state=state' : '';
  const pathName =
    settings.ONE_LOGIN_SHOW_ONE_LOGIN === true ? '/verify/invite/onelogin' : '/verify/invite/';
  let verifyUserServiceStub;

  beforeEach(() => {
    chai.use(sinonChai);
    req = {
      session: {},
      query: {
        query: 'Example Incoming Unhashed Token',
      },
      get: sinon.stub().returns('stubbed-header'),
      originalUrl: pathName,
    };

    res = {
      render: sinon.spy(),
      cookie: sinon.stub(),
      redirect: sinon.stub(),
    };
    sinon.stub(tokenService, 'generateHash').returns('HashedToken123');
    verifyUserServiceStub = sinon.stub(verifyUserService, 'getUserInviteTokenByTokenId');
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should clear the cookie and set a hashed token before render', async () => {
    const cookie = new CookieModel(req);
    cookie.reset();
    cookie.initialise();
    cookie.setInviteUserToken('HashedToken123');
    oneLoginUrlStub = sinon
      .stub(oneLoginUtils, 'getOneLoginAuthUrl')
      .returns('https://onelogin?code=123&state=state');
    verifyUserServiceStub.resolves('Token is valid');
    await controller(req, res);

    // CookieModel instance created, can that be asserted
    expect(tokenService.generateHash).to.have.been.calledOnceWithExactly(
      'Example Incoming Unhashed Token'
    );
    expect(cookie.getInviteUserToken()).to.eq('HashedToken123');
    expect(res.render).to.have.been.calledOnceWithExactly('app/verify/organisationinvite/index', {
      pathName,
      oneLoginAuthUrl,
    });
  });
});
