/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */

import sinon from 'sinon';

import { expect } from 'chai';
import chai from 'chai';
import sinonChai from 'sinon-chai';
import '../../global.test.js';
import CookieModel from '../../../common/models/Cookie.class.js';
import validator from '../../../common/utils/validator.js';
import ValidationRule from '../../../common/models/ValidationRule.class.js';
import tokenService from '../../../common/services/create-token.js';
import tokenApi from '../../../common/services/tokenApi.js';
import emailService from '../../../common/services/sendEmail.js';
import config from '../../../common/config/index.js';
import roles from '../../../common/seeddata/egar_user_roles.json' with { type: "json"};
import oneLoginApi from '../../../common/services/oneLoginApi.js';
import controller from '../../../app/organisation/assignrole/post.controller.js';
import { cookie } from 'request';


describe('Organisation Assign Role Post Controller', () => {
  let req; 
  let res;
  let tokenServiceStub; 
  let tokenApiStub; 
  let emailServiceStub;
  const TEMPLATE_ID = config.ONE_LOGIN_SHOW_ONE_LOGIN === true ? 'NOTIFY_ONE_LOGIN_INVITE_TEMPLATE_ID' : 'NOTIFY_INVITE_TEMPLATE_ID';
  const indexPage = config.ONE_LOGIN_SHOW_ONE_LOGIN  === true ? 'onelogin_page' :  'old_invite_page';
  
  beforeEach(() => {
    chai.use(sinonChai);

    req = {
      body: {
        role: 'SuperUser',
      },
      session: {
        u: { dbId: 'USER-DB-ID-1', fn: 'Sheev' },
        org: { i: 'ORG-ID-1', name: 'Sith' },
        inv: { e: 'persontoinvite@random.com', fn: 'Anakin', ln: 'Test', rl: 'NormalUser' },
      },
      get: sinon.stub().withArgs('Authorization').returns('Bearer token')
  
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
    cookie.setUserRole('Admin');

    const callController = async () => {
      await controller(req, res);
    };

    callController().then(() => {
      expect(req.session.inv.rl).to.eq('');
      expect(tokenApiStub).to.not.have.been.called;
      expect(emailServiceStub).to.not.have.been.called;
      expect(res.redirect).to.not.have.been.called;
      expect(res.render).to.have.been.calledOnceWithExactly('app/organisation/assignrole/index', {
        cookie,
        roles,
        errors: [
          new ValidationRule(validator.notEmpty, 'role', '', 'Select a role'),
        ],
      });
    });
  });

  it('should render with error messages if api rejects', () => {
    tokenApiStub.rejects({ message: 'tokenApi.generateHash Example Reject' });
    cookie = new CookieModel(req);
    cookie.setInviteUserEmail('inviteemail@mail.com')
    cookie.setUserRole('Admin');

    const callController = async () => {
      await controller(req, res);
    };

    callController().then().then(() => {
      expect(req.session.inv.rl).to.eq('SuperUser');
      expect(tokenApiStub).to.have.been.calledOnceWithExactly('ExampleGeneratedHash', 'USER-DB-ID-1', 'ORG-ID-1', 'SuperUser', cookie.getInviteUserEmail());
      expect(emailServiceStub).to.not.have.been.called;
      expect(res.redirect).to.not.have.been.called;
      expect(res.render).to.have.been.calledOnceWithExactly('app/organisation/assignrole/index', {
        cookie,
        roles,
        errors: [{ message: 'tokenApi.generateHash Example Reject' }],
      });
    });
  });

  // Message
  it('should render with error messages if api returns one', () => {
    tokenApiStub.resolves(JSON.stringify({ message: 'User ID not found' }));
    cookie = new CookieModel(req);
    cookie.setUserRole('Admin');

    const callController = async () => {
      await controller(req, res);
    };

    callController().then().then(() => {
      expect(req.session.inv.rl).to.eq('SuperUser');
      expect(tokenApiStub).to.have.been.calledOnceWithExactly('ExampleGeneratedHash', 'USER-DB-ID-1', 'ORG-ID-1', 'SuperUser', cookie.getInviteUserEmail());
      expect(emailServiceStub).to.not.have.been.called;
      expect(res.redirect).to.not.have.been.called;
      expect(res.render).to.have.been.calledOnceWithExactly('app/organisation/assignrole/index', {
        cookie,
        roles,
        errors: [{ message: 'User ID not found' }],
      });
    });
  });

  it('should render with error messages if email api rejects', () => {
    sinon.stub(config, TEMPLATE_ID).value(indexPage);
    sinon.stub(config, 'BASE_URL').value('http://www.somewhere.com');
  
    tokenApiStub.resolves(JSON.stringify({}));
    emailServiceStub.rejects({ message: 'emailService.send Example Reject' });
    cookie = new CookieModel(req);
    cookie.setUserRole('Admin');

    const callController = async () => {
      await controller(req, res);
    };

    callController().then().then().then(() => {
      const generatedToken = tokenServiceStub.getCall(0).args[0];
      expect(req.session.inv.rl).to.eq('SuperUser');
      expect(tokenApiStub).to.have.been.calledOnceWithExactly('ExampleGeneratedHash', 'USER-DB-ID-1', 'ORG-ID-1', 'SuperUser', cookie.getInviteUserEmail());
      expect(emailServiceStub).to.have.been.calledOnceWithExactly(indexPage, 'persontoinvite@random.com', {
        firstname: 'Anakin',
        lastname: 'Test',
        user: 'Sheev',
        org_name: 'Sith',
        base_url: 'http://www.somewhere.com',
        token: generatedToken,
      });
      expect(res.redirect).to.not.have.been.called;
      expect(res.render).to.have.been.calledOnceWithExactly('app/organisation/assignrole/index', {
        cookie,
        roles,
        errors: [{ message: 'Could not send an invitation email, try again later.' }],
      });
    });
  });

  it('should redirect if email api ok', () => {
    sinon.stub(config, TEMPLATE_ID).value(indexPage);
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
      expect(tokenApiStub).to.have.been.calledOnceWithExactly('ExampleGeneratedHash', 'USER-DB-ID-1', 'ORG-ID-1', 'SuperUser', cookie.getInviteUserEmail());
      expect(emailServiceStub).to.have.been.calledOnceWithExactly(indexPage, 'persontoinvite@random.com', {
        firstname: 'Anakin',
        lastname: 'Test',
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
