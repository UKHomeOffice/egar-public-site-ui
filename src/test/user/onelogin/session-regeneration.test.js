const sinon = require('sinon');
const { expect } = require('chai');
const chai = require('chai');
const sinonChai = require('sinon-chai');
const proxyquire = require('proxyquire').noCallThru();

require('../../global.test');

const { PHASE_CONFIRM_NAME, PHASE_REGISTRATION_COMPLETE } = require('../../../app/user/onelogin/constants');

describe('To Regenerate Session when User is Signup on OneLogin', () => {
  beforeEach(() => {
    chai.use(sinonChai);
  });

  afterEach(() => {
    sinon.restore();
  });

  function buildRequest() {
    return {
      session: {
        id_token: 'id_token_before_regeneration',
        access_token: 'access_token_before_regeneration',
        step: PHASE_CONFIRM_NAME,
        step_data: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          sub: 'onelogin_sub_id',
        },
        save: sinon.spy(),
      },
      body: {
        nameConfirmDeclaration: 'on',
      },
      cookies: {
        state: 'valid_state',
        nonce: 'valid_nonce',
      },
    };
  }

  function buildResponse() {
    return {
      redirect: sinon.spy(),
      render: sinon.spy(),
      clearCookie: sinon.spy(),
    };
  }

  it('regenerates session during confirm-name step and continues registration flow', async () => {
    const req = buildRequest();
    const res = buildResponse();

    const sessionRegenerateForAuthenticatedUserStub = sinon.stub().callsFake(async () => {
      req.session = {
        save: sinon.spy(),
      };
      return true;
    });

    const createUserStub = sinon.stub().resolves({
      userId: 'USER-1',
      state: 'verified',
      role: { name: 'Individual' },
      organisation: { organisationId: 'ORG-1' },
    });

    const getUserInviteTokenStub = sinon.stub().resolves({ tokenId: 'TOKEN-1' });
    const sendEmailStub = sinon.stub().resolves();

    const controller = proxyquire('../../../app/user/onelogin/post.controller', {
      '../../../common/services/dataAccessApi': {
        userManageApi: { createUser: createUserStub },
        verificationApi: { getUserInviteToken: getUserInviteTokenStub },
      },
      '../../../common/services/sendEmail': {
        send: sendEmailStub,
      },
      '../../../common/utils/session_generator': {
        sessionRegenerateForAuthenticatedUser: sessionRegenerateForAuthenticatedUserStub,
      },
    });

    await controller(req, res);

    expect(sessionRegenerateForAuthenticatedUserStub).to.have.been.calledOnceWith(req);
    expect(req.session.id_token).to.equal('id_token_before_regeneration');
    expect(req.session.access_token).to.equal('access_token_before_regeneration');
    expect(req.session.u.dbId).to.equal('USER-1');
    expect(req.session.u.vr).to.equal(true);
    expect(req.session.u.rl).to.equal('Individual');
    expect(req.session.step).to.equal(PHASE_REGISTRATION_COMPLETE);
    expect(req.session.save).to.have.been.calledOnce;
    expect(res.redirect).to.have.been.calledOnceWith('/onelogin/register');
  });

  it('redirects to error when session regeneration fails', async () => {
    const req = buildRequest();
    const res = buildResponse();

    const sessionRegenerateForAuthenticatedUserStub = sinon.stub().resolves(false);
    const createUserStub = sinon.stub().resolves({
      userId: 'USER-1',
      state: 'verified',
      role: { name: 'Individual' },
      organisation: { organisationId: 'ORG-1' },
    });

    const getUserInviteTokenStub = sinon.stub().resolves({ tokenId: 'TOKEN-1' });
    const sendEmailStub = sinon.stub().resolves();

    const controller = proxyquire('../../../app/user/onelogin/post.controller', {
      '../../../common/services/dataAccessApi': {
        userManageApi: { createUser: createUserStub },
        verificationApi: { getUserInviteToken: getUserInviteTokenStub },
      },
      '../../../common/services/sendEmail': {
        send: sendEmailStub,
      },
      '../../../common/utils/session_generator': {
        sessionRegenerateForAuthenticatedUser: sessionRegenerateForAuthenticatedUserStub,
      },
    });

    await controller(req, res);

    expect(sessionRegenerateForAuthenticatedUserStub).to.have.been.calledOnceWith(req);
    expect(sendEmailStub).to.not.have.been.called;
    expect(res.redirect).to.have.been.calledOnceWith('error/404');
  });
});
