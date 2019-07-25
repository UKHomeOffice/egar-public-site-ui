/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */

const sinon = require('sinon');
const { expect } = require('chai');
const chai = require('chai');
const sinonChai = require('sinon-chai');

require('../../global.test');
const CookieModel = require('../../../common/models/Cookie.class');
const validator = require('../../../common/utils/validator');
const ValidationRule = require('../../../common/models/ValidationRule.class');
const tokenService = require('../../../common/services/create-token');
const tokenApi = require('../../../common/services/tokenApi');
const emailService = require('../../../common/services/sendEmail');
const config = require('../../../common/config/index');

const controller = require('../../../app/organisation/assignrole/post.controller');

describe('Organisation Assign Role Post Controller', () => {
  let req; let res;
  let tokenServiceStub; let tokenApiStub; let emailServiceStub;

  beforeEach(() => {
    chai.use(sinonChai);

    req = {
      body: {
        role: 'SuperUser',
      },
      session: {
        u: { dbId: 'USER-DB-ID-1', fn: 'Sheev' },
        org: { i: 'ORG-ID-1', name: 'Sith' },
        inv: { e: 'persontoinvite@random.com', fn: 'Anakin', rl: 'NormalUser' },
      },
    };
    res = {
      redirect: sinon.stub(),
      render: sinon.stub(),
    };

    tokenServiceStub = sinon.stub(tokenService, 'generateHash').returns('ExampleGeneratedHash');
    tokenApiStub = sinon.stub(tokenApi, 'setInviteUserToken');
    emailServiceStub = sinon.stub(emailService, 'send');
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should render message when role empty', () => {
    req.body.role = '';
    cookie = new CookieModel(req);

    const callController = async () => {
      await controller(req, res);
    };

    callController().then(() => {
      expect(req.session.inv.rl).to.eq('');
      expect(tokenApiStub).to.not.have.been.called;
      expect(emailServiceStub).to.not.have.been.called;
      expect(res.redirect).to.not.have.been.called;
      expect(res.render).to.have.been.calledOnceWithExactly('app/organisation/inviteusers/index', {
        cookie,
        errors: [
          new ValidationRule(validator.notEmpty, 'role', '', 'Select a role'),
        ],
      });
    });
  });

  it('should render with error messages if api rejects', () => {
    tokenApiStub.rejects({ message: 'tokenApi.generateHash Example Reject' });
    cookie = new CookieModel(req);

    const callController = async () => {
      await controller(req, res);
    };

    callController().then().then(() => {
      expect(req.session.inv.rl).to.eq('SuperUser');
      expect(tokenApiStub).to.have.been.calledOnceWithExactly('ExampleGeneratedHash', 'USER-DB-ID-1', 'ORG-ID-1', 'SuperUser');
      expect(emailServiceStub).to.not.have.been.called;
      expect(res.redirect).to.not.have.been.called;
      expect(res.render).to.have.been.calledOnceWithExactly('app/organisation/inviteusers/index', {
        cookie,
        errors: [{ message: 'tokenApi.generateHash Example Reject' }],
      });
    });
  });

  // Message
  it('should render with error messages if api returns one', () => {
    tokenApiStub.resolves(JSON.stringify({ message: 'User ID not found' }));
    cookie = new CookieModel(req);

    const callController = async () => {
      await controller(req, res);
    };

    callController().then().then(() => {
      expect(req.session.inv.rl).to.eq('SuperUser');
      expect(tokenApiStub).to.have.been.calledOnceWithExactly('ExampleGeneratedHash', 'USER-DB-ID-1', 'ORG-ID-1', 'SuperUser');
      expect(emailServiceStub).to.not.have.been.called;
      expect(res.redirect).to.not.have.been.called;
      expect(res.render).to.have.been.calledOnceWithExactly('app/organisation/inviteusers/index', {
        cookie,
        errors: [{ message: 'User ID not found' }],
      });
    });
  });

  it('should render with error messages if email api rejects', () => {
    sinon.stub(config, 'NOTIFY_INVITE_TEMPLATE_ID').value('EXAMPLE_TEMPLATE_ID');
    sinon.stub(config, 'BASE_URL').value('http://www.somewhere.com');
    tokenApiStub.resolves(JSON.stringify({}));
    emailServiceStub.rejects({ message: 'emailService.send Example Reject' });
    cookie = new CookieModel(req);

    const callController = async () => {
      await controller(req, res);
    };

    callController().then().then().then(() => {
      const generatedToken = tokenServiceStub.getCall(0).args[0];
      expect(req.session.inv.rl).to.eq('SuperUser');
      expect(tokenApiStub).to.have.been.calledOnceWithExactly('ExampleGeneratedHash', 'USER-DB-ID-1', 'ORG-ID-1', 'SuperUser');
      expect(emailServiceStub).to.have.been.calledOnceWithExactly('EXAMPLE_TEMPLATE_ID', 'persontoinvite@random.com', {
        firstname: 'Anakin',
        user: 'Sheev',
        org_name: 'Sith',
        base_url: 'http://www.somewhere.com',
        token: generatedToken,
      });
      expect(res.redirect).to.not.have.been.called;
      expect(res.render).to.have.been.calledOnceWithExactly('app/organisation/inviteusers/index', {
        cookie,
        errors: [{ message: 'emailService.send Example Reject' }],
      });
    });
  });

  it('should redirect if email api ok', () => {
    sinon.stub(config, 'NOTIFY_INVITE_TEMPLATE_ID').value('EXAMPLE_TEMPLATE_ID');
    sinon.stub(config, 'BASE_URL').value('http://www.somewhere.com');
    tokenApiStub.resolves(JSON.stringify({}));
    emailServiceStub.resolves();
    cookie = new CookieModel(req);

    const callController = async () => {
      await controller(req, res);
    };

    callController().then().then().then(() => {
      const generatedToken = tokenServiceStub.getCall(0).args[0];
      expect(req.session.inv.rl).to.eq('SuperUser');
      expect(tokenApiStub).to.have.been.calledOnceWithExactly('ExampleGeneratedHash', 'USER-DB-ID-1', 'ORG-ID-1', 'SuperUser');
      expect(emailServiceStub).to.have.been.calledOnceWithExactly('EXAMPLE_TEMPLATE_ID', 'persontoinvite@random.com', {
        firstname: 'Anakin',
        user: 'Sheev',
        org_name: 'Sith',
        base_url: 'http://www.somewhere.com',
        token: generatedToken,
      });
      expect(res.redirect).to.have.been.calledOnceWithExactly('/organisation/invite/success');
      expect(res.render).to.not.have.been.called;
    });
  });
});
