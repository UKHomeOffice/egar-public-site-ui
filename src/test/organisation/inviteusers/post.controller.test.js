const sinon = require('sinon');
const { expect } = require('chai');
const chai = require('chai');
const sinonChai = require('sinon-chai');

require('../../global.test');
const CookieModel = require('../../../common/models/Cookie.class');
const validator = require('../../../common/utils/validator');
const ValidationRule = require('../../../common/models/ValidationRule.class');
const { userManageApi: userApi } = require('../../../common/services/dataAccessApi');
const controller = require('../../../app/organisation/inviteusers/post.controller');

describe('Organisation Invite User Post Controller', () => {
  let req;
  let res;
  let cookie;
  let getDetailsStub;

  beforeEach(() => {
    chai.use(sinonChai);

    req = {
      body: {
        fname: 'Jonathon',
        lname: 'Archer',
        email: 'prequel@enterprise.net',
        cemail: 'prequel@enterprise.net',
      },
      session: {},
    };

    res = {
      render: sinon.spy(),
      redirect: sinon.spy(),
    };

    getDetailsStub = sinon.stub(userApi, 'getDetails');
  });

  afterEach(() => {
    sinon.restore();
  });

  it('continues to role assignment for the backend unregistered-user HTTP response', async () => {
    getDetailsStub.rejects(
      Object.assign(new Error('Bad Request'), {
        type: 'http_error',
        status: 400,
        body: { message: 'User not registered' },
      })
    );

    await controller(req, res);

    expect(getDetailsStub).to.have.been.calledOnceWithExactly('prequel@enterprise.net');
    expect(req.session.inv).to.include({ fn: 'Jonathon', ln: 'Archer', e: 'prequel@enterprise.net' });
    expect(res.redirect).to.have.been.calledOnceWithExactly('/organisation/assignrole');
    expect(res.render).not.to.have.been.called;
  });

  [
    ['http_error', 400, { message: 'User email not verified' }],
    ['http_error', 503, { message: 'User not registered' }],
    ['network_error', undefined, undefined],
  ].forEach(([type, status, body]) => {
    it(`does not proceed to role assignment on ${type} ${status || ''} ${body?.message || ''}`, async () => {
      getDetailsStub.rejects(Object.assign(new Error('Request failed'), { type, status, body }));

      await controller(req, res);

      expect(res.redirect).to.have.been.calledOnceWithExactly('/organisation/inviteuser');
      expect(res.render).not.to.have.been.called;
    });
  });

  describe('validations', () => {
    beforeEach(() => {
      cookie = new CookieModel(req);
    });

    it('should render messages when strings empty', () => {
      req.body.fname = '';
      req.body.lname = '';
      req.body.email = '';
      req.body.cemail = '';

      const callController = async () => {
        await controller(req, res);
      };

      return callController().then(() => {
        expect(res.redirect).to.not.have.been.called;
        expect(res.render).to.have.been.calledOnceWithExactly('app/organisation/inviteusers/index', {
          cookie,
          fname: '',
          lname: '',
          email: '',
          errors: [
            new ValidationRule(validator.notEmpty, 'fname', req.body.fname, 'Please enter the given names of the user'),
            new ValidationRule(validator.notEmpty, 'lname', req.body.lname, 'Please enter the surname of the user'),
            new ValidationRule(
              validator.notEmpty,
              'email',
              req.body.email,
              'Please enter the email address of the user'
            ),
          ],
        });
      });
    });

    it('should render messages when strings too long', () => {
      req.body.fname = 'abcdefghijklmnopqrstuvwxyzabcdefghijk';
      req.body.lname = 'abcdefghijklmnopqrstuvwxyzabcdefghij';
      req.body.email =
        '123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890@yikes.com';
      req.body.cemail = '';

      const callController = async () => {
        await controller(req, res);
      };

      return callController().then(() => {
        expect(req.session.inv.fn).to.be.null;
        expect(req.session.inv.ln).to.be.null;
        expect(req.session.inv.e).to.be.null;
        expect(res.redirect).to.not.have.been.called;
        expect(res.render).to.have.been.calledOnceWithExactly('app/organisation/inviteusers/index', {
          cookie,
          fname: 'abcdefghijklmnopqrstuvwxyzabcdefghijk',
          lname: 'abcdefghijklmnopqrstuvwxyzabcdefghij',
          email:
            '123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890@yikes.com',
          errors: [
            new ValidationRule(
              validator.isValidStringLength,
              'fname',
              'abcdefghijklmnopqrstuvwxyzabcdefghijk',
              'Given names must be 35 characters or less'
            ),
            new ValidationRule(
              validator.isValidStringLength,
              'lname',
              'abcdefghijklmnopqrstuvwxyzabcdefghij',
              'Surname must be 35 characters or less'
            ),
            new ValidationRule(
              validator.isValidEmailLength,
              'email',
              '123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890@yikes.com',
              'Email must be 150 characters or less'
            ),
            new ValidationRule(validator.valuetrue, 'cemail', false, 'Please ensure the email addresses match'),
          ],
        });
      });
    });

    it('should render message when emails do not match', () => {
      req.body.fname = 'Malcolm';
      req.body.lname = 'Reynolds';
      req.body.email = 'mal@serenity.com';
      req.body.cemail = 'mal@serenety.com';

      const callController = async () => {
        await controller(req, res);
      };

      return callController().then(() => {
        expect(req.session.inv.fn).to.be.null;
        expect(req.session.inv.ln).to.be.null;
        expect(req.session.inv.e).to.be.null;
        expect(res.redirect).to.not.have.been.called;
        expect(res.render).to.have.been.calledOnceWithExactly('app/organisation/inviteusers/index', {
          cookie,
          fname: 'Malcolm',
          lname: 'Reynolds',
          email: 'mal@serenity.com',
          errors: [new ValidationRule(validator.valuetrue, 'cemail', false, 'Please ensure the email addresses match')],
        });
      });
    });
  });

  it('should redirect if valid', () => {
    const callController = async () => {
      await controller(req, res);
    };

    getDetailsStub.resolves({ email: 'prequel@enterprise.net', message: 'User not registered' });
    return callController().then(() => {
      expect(req.session.inv.fn).to.eq('Jonathon');
      expect(req.session.inv.ln).to.eq('Archer');
      expect(req.session.inv.e).to.eq('prequel@enterprise.net');
      expect(res.redirect).to.have.been.calledOnceWithExactly('/organisation/assignrole');
      expect(getDetailsStub).to.have.been.calledOnceWith('prequel@enterprise.net');
      expect(res.render).to.not.have.been.called;
    });
  });

  it('should render to error page if user is already exist', () => {
    const cookie = new CookieModel(req);
    const callController = async () => {
      await controller(req, res);
    };

    getDetailsStub.resolves({ email: 'prequel@enterprise.net' });
    return callController().then(() => {
      expect(res.render).to.have.been.calledOnceWithExactly('app/organisation/inviteusers/userExistError', {
        cookie,
      });
    });
  });
});
