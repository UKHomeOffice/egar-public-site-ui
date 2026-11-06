const sinon = require('sinon');
const chai = require('chai');

chai.use(require('sinon-chai'));
const { expect } = chai;
require('../../global.test');
const CookieModel = require('../../../common/models/Cookie.class');
const { tokenApi } = require('../../../common/services/dataAccessApi');
const tokenService = require('../../../common/services/create-token');
const emailService = require('../../../common/services/sendEmail');
const config = require('../../../common/config');
const roles = require('../../../common/seeddata/egar_user_roles.json');
const { getRolesForAssigning } = require('../../../common/utils/utils');
const ValidationRule = require('../../../common/models/ValidationRule.class');
const validator = require('../../../common/utils/validator');
const { ROLE_PERMISSION_ERROR_MSG } = require('../../../app/organisation/constants');
const controller = require('../../../app/organisation/assignrole/post.controller');

describe('Organisation Assign Role Post Controller', () => {
  let req;
  let res;
  let tokenStub;
  let hashStub;
  let emailStub;

  beforeEach(() => {
    req = {
      body: { role: 'Admin' },
      session: {
        u: { dbId: 'user-1', fn: 'Test', rl: 'Admin' },
        org: { i: 'org-1', name: 'Test organisation' },
        inv: { e: 'Invitee@Example.com', fn: 'Alex', ln: 'Test' },
      },
      get: sinon.stub(),
    };
    res = { render: sinon.spy(), redirect: sinon.spy() };
    hashStub = sinon.stub(tokenService, 'generateHash').returns('hashed-token');
    tokenStub = sinon.stub(tokenApi, 'setInviteUserToken').resolves({ tokenSet: true });
    emailStub = sinon.stub(emailService, 'send').resolves();
    sinon.stub(config, 'BASE_URL').value('https://app.example.test');
    sinon.stub(config, 'NOTIFY_ONE_LOGIN_INVITE_TEMPLATE_ID').value('invite-template');
  });

  afterEach(() => sinon.restore());

  it('renders validation errors without creating a token or sending email when no role is selected', async () => {
    req.body.role = '';

    await controller(req, res);

    expect(tokenStub).not.to.have.been.called;
    expect(emailStub).not.to.have.been.called;
    expect(res.redirect).not.to.have.been.called;
    expect(res.render).to.have.been.calledOnceWithExactly('app/organisation/assignrole/index', {
      cookie: new CookieModel(req),
      roles,
      errors: [new ValidationRule(validator.notEmpty, 'role', '', 'Select a role')],
    });
  });

  it('rejects a manager assigning the Admin role before creating a token', async () => {
    req.session.u.rl = 'Manager';

    await controller(req, res);

    expect(tokenStub).not.to.have.been.called;
    expect(emailStub).not.to.have.been.called;
    expect(res.redirect).not.to.have.been.called;
    expect(res.render).to.have.been.calledOnceWithExactly('app/organisation/assignrole/index', {
      cookie: new CookieModel(req),
      roles: getRolesForAssigning('Manager'),
      errors: [new ValidationRule(null, 'role', 'Admin', ROLE_PERMISSION_ERROR_MSG)],
    });
  });

  it('creates the hashed invitation token before emailing the raw token and redirecting', async () => {
    await controller(req, res);

    const rawToken = hashStub.firstCall.args[0];
    expect(rawToken).to.match(/^[23456789abcdefghjkmnpqrstuvwxyz-]{13}$/);
    expect(hashStub).to.have.been.calledOnce;
    expect(tokenStub).to.have.been.calledOnceWithExactly(
      'hashed-token',
      'user-1',
      'org-1',
      'Admin',
      'invitee@example.com'
    );
    expect(emailStub).to.have.been.calledOnceWithExactly('invite-template', 'invitee@example.com', {
      firstname: 'Alex',
      lastname: 'Test',
      user: 'Test',
      org_name: 'Test organisation',
      base_url: 'https://app.example.test',
      token: rawToken,
    });
    expect(res.redirect).to.have.been.calledOnceWithExactly('/organisation/invite/success');
    expect(res.render).not.to.have.been.called;
    sinon.assert.callOrder(tokenStub, emailStub, res.redirect);
  });

  [
    ['message response', { message: 'Inviter not found' }],
    ['http_error', { message: 'Inviter not found' }],
    ['network_error', null],
  ].forEach(([type, body]) => {
    it(`does not send email or report success after a token ${type}`, async () => {
      const failure = Object.assign(new Error('Request failed'), {
        type,
        ...(type === 'http_error' ? { status: 400, body } : {}),
      });
      if (type === 'message response') tokenStub.resolves(body);
      else tokenStub.rejects(failure);

      await controller(req, res);

      expect(emailStub).not.to.have.been.called;
      expect(res.redirect).not.to.have.been.called;
      expect(res.render).to.have.been.calledOnceWithExactly('app/organisation/assignrole/index', {
        cookie: new CookieModel(req),
        roles,
        errors: [body || failure],
      });
    });
  });

  it('renders the email error without reporting success when Notify rejects', async () => {
    emailStub.rejects(new Error('Notify returned 403'));

    await controller(req, res);

    expect(tokenStub).to.have.been.calledOnce;
    expect(emailStub).to.have.been.calledOnce;
    expect(res.redirect).not.to.have.been.called;
    expect(res.render).to.have.been.calledOnceWithExactly('app/organisation/assignrole/index', {
      cookie: new CookieModel(req),
      roles,
      errors: [{ message: 'Could not send an invitation email, try again later.' }],
    });
  });
});
