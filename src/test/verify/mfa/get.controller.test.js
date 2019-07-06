/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */

const sinon = require('sinon');
const { expect } = require('chai');
const chai = require('chai');
const sinonChai = require('sinon-chai');

const CookieModel = require('../../../common/models/Cookie.class');
const tokenService = require('../../../common/services/create-token');
const tokenApi = require('../../../common/services/tokenApi');
const emailService = require('../../../common/services/sendEmail');
const settings = require('../../../common/config/index');

const controller = require('../../../app/verify/mfa/get.controller');

describe('Verify MFA Get Controller', () => {
  let req; let res;

  beforeEach(() => {
    chai.use(sinonChai);

    req = {
      session: {
        u: {
          e: 'example@somewhere.com',
          vr: true,
        },
      },
      query: {
        resend: 'true',
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

  it('should only render the page if resend flag not set', async () => {
    const emptyReq = {
      session: {},
      query: {
        resend: 'false',
      },
    };
    sinon.stub(tokenApi, 'setMfaToken');
    settings.MFA_TOKEN_LENGTH = 20;
    const cookie = new CookieModel(emptyReq);
    await controller(emptyReq, res);

    expect(tokenApi.setMfaToken).to.not.have.been.called;
    expect(res.render).to.have.been.calledWith('app/verify/mfa/index', { cookie, mfaTokenLength: 20 });
  });

  // TODO: Essentially, existing functionality just returns you to the page if you are
  // unverified. In the future, this screen should not even be possible to enter if
  // the user is unverified...
  it('should create a token and send an email if verified user', async () => {
    sinon.stub(tokenApi, 'setMfaToken').resolves();
    sinon.stub(tokenService, 'genMfaToken').returns('123456');
    sinon.stub(emailService, 'send');
    settings.MFA_TOKEN_LENGTH = 20;
    settings.NOTIFY_MFA_TEMPLATE_ID = 12345;
    const cookie = new CookieModel(req);

    await controller(req, res);

    expect(tokenApi.setMfaToken).to.have.been.called;
    expect(emailService.send).to.have.been.calledWith(12345, 'example@somewhere.com', { mfaToken: '123456' });
    expect(res.render).to.have.been.calledWith('app/verify/mfa/index', {
      cookie, mfaTokenLength: 20, successHeader: 'We have resent your code', successMsg: 'Check your email',
    });
  });

  it('should not send an email if verified user but token rejects', async () => {
    sinon.stub(tokenApi, 'setMfaToken').rejects('Example Reject');
    sinon.stub(tokenService, 'genMfaToken').returns('123456');
    sinon.stub(emailService, 'send');
    settings.MFA_TOKEN_LENGTH = 20;
    settings.NOTIFY_MFA_TEMPLATE_ID = 12345;
    const cookie = new CookieModel(req);

    try {
      await controller(req, res);
    } catch (err) {
      expect(tokenApi.setMfaToken).to.have.been.calledWith('example@somewhere.com', '123456', true);
      expect(res.render).to.have.been.calledWith('app/verify/mfa/index', {
        cookie, mfaTokenLength: 20, errors: [{ message: 'There was a problem creating your code. Try again' }],
      });
    }
  });

  it('should render with a check your mail message if unverified', async () => {
    const emptyReq = {
      session: {
        u: {
          vr: false,
        },
      },
      query: {
        resend: 'true',
      },
    };
    sinon.stub(tokenApi, 'setMfaToken');
    settings.MFA_TOKEN_LENGTH = 20;
    const cookie = new CookieModel(emptyReq);
    await controller(emptyReq, res);

    expect(tokenApi.setMfaToken).to.not.have.been.called;
    expect(res.render).to.have.been.calledWith('app/verify/mfa/index', {
      cookie, mfaTokenLength: 20, successHeader: 'We have resent your code', successMsg: 'Check your email',
    });
  });
});
