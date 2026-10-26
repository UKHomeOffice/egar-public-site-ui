const sinon = require('sinon');
const { expect } = require('chai');
const chai = require('chai');
const sinonChai = require('sinon-chai');

require('../../global.test');
const CookieModel = require('../../../common/models/Cookie.class');
const tokenService = require('../../../common/services/create-token');
const { verificationApi: verifyUserService } = require('../../../common/services/dataAccessApi');

const controller = require('../../../app/verify/registeruser/get.controller');

describe('Verify Register User Get Controller', () => {
  let req;
  let res;

  beforeEach(() => {
    chai.use(sinonChai);

    req = {
      session: {},
      query: {
        token: 'Example Token',
      },
    };

    res = {
      render: sinon.spy(),
    };

    sinon.stub(tokenService, 'generateHash').returns('Token123');
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should render the register user page when user service resolves', async () => {
    sinon.stub(verifyUserService, 'verifyUser').resolves({ tokenId: 'Token123' });
    const cookie = new CookieModel(req);
    await controller(req, res);

    expect(tokenService.generateHash).to.have.been.calledOnceWithExactly('Example Token');
    expect(verifyUserService.verifyUser).to.have.been.calledOnceWithExactly('Token123');
    expect(res.render).to.have.been.calledOnceWithExactly('app/verify/registeruser/index', { cookie });
  });

  ['http_error', 'network_error'].forEach((type) => {
    it(`renders the verification error on a ${type}`, async () => {
      sinon.stub(verifyUserService, 'verifyUser').rejects(
        Object.assign(new Error('Verification failed'), {
          type,
          ...(type === 'http_error' ? { status: 400, body: { message: 'Token is invalid' } } : {}),
        })
      );
      const cookie = new CookieModel(req);
      await controller(req, res);

      expect(verifyUserService.verifyUser).to.have.been.calledOnceWithExactly('Token123');
      expect(res.render).to.have.been.calledOnceWithExactly('app/verify/registeruser/index', {
        cookie,
        message: 'There was an issue verifying your account. Please try again later.',
      });
    });
  });
});
