/* eslint-disable no-undef */
/* eslint-disable no-unused-expressions */

import sinon from 'sinon';

import { expect } from 'chai';
import chai from 'chai';
import sinonChai from 'sinon-chai';
import '../../global.test.js';
import CookieModel from '../../../common/models/Cookie.class.js';
import validator from '../../../common/utils/validator.js';
import ValidationRule from '../../../common/models/ValidationRule.class.js';
import userApi from '../../../common/services/userManageApi.js';
import controller from '../../../app/organisation/inviteusers/post.controller.js';

describe('Organisation Invite User Post Controller', () => {
  let req; let res; let cookie;
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

    getDetailsStub = sinon.stub(userApi, 'getDetails')
  });

  afterEach(() => {
    sinon.restore();
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

      callController().then(() => {
        expect(res.redirect).to.not.have.been.called;
        expect(res.render).to.have.been.calledOnceWithExactly('app/organisation/inviteusers/index', {
          cookie,
          fname: '',
          lname: '',
          email: '',
          errors: [
            new ValidationRule(validator.notEmpty, 'fname', req.body.fname, 'Please enter the given names of the user'),
            new ValidationRule(validator.notEmpty, 'lname', req.body.lname, 'Please enter the surname of the user'),
            new ValidationRule(validator.notEmpty, 'email', req.body.email, 'Please enter the email address of the user'),
          ],
        });
      });
    });

    it('should render messages when strings too long', () => {
      req.body.fname = 'abcdefghijklmnopqrstuvwxyzabcdefghijk';
      req.body.lname = 'abcdefghijklmnopqrstuvwxyzabcdefghij';
      req.body.email = '123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890@yikes.com';
      req.body.cemail = '';

      const callController = async () => {
        await controller(req, res);
      };

      callController().then(() => {
        expect(req.session.inv.fn).to.be.null;
        expect(req.session.inv.ln).to.be.null;
        expect(req.session.inv.e).to.be.null;
        expect(res.redirect).to.not.have.been.called;
        expect(res.render).to.have.been.calledOnceWithExactly('app/organisation/inviteusers/index', {
          cookie,
          fname: 'abcdefghijklmnopqrstuvwxyzabcdefghijk',
          lname: 'abcdefghijklmnopqrstuvwxyzabcdefghij',
          email: '123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890@yikes.com',
          errors: [
            new ValidationRule(validator.isValidStringLength, 'fname', 'abcdefghijklmnopqrstuvwxyzabcdefghijk', 'Given names must be 35 characters or less'),
            new ValidationRule(validator.isValidStringLength, 'lname', 'abcdefghijklmnopqrstuvwxyzabcdefghij', 'Surname must be 35 characters or less'),
            new ValidationRule(validator.isValidEmailLength, 'email',
              '123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890@yikes.com', 'Email must be 150 characters or less'),
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

      callController().then(() => {
        expect(req.session.inv.fn).to.be.null;
        expect(req.session.inv.ln).to.be.null;
        expect(req.session.inv.e).to.be.null;
        expect(res.redirect).to.not.have.been.called;
        expect(res.render).to.have.been.calledOnceWithExactly('app/organisation/inviteusers/index', {
          cookie,
          fname: 'Malcolm',
          lname: 'Reynolds',
          email: 'mal@serenity.com',
          errors: [
            new ValidationRule(validator.valuetrue, 'cemail', false, 'Please ensure the email addresses match'),
          ],
        });
      });
    });
  });

  it('should redirect if valid', () => {
    const callController = async () => {
      await controller(req, res);
    };

    getDetailsStub.resolves({email: 'prequel@enterprise.net', 'message': 'User not registered'});
    callController().then(() => {
      expect(req.session.inv.fn).to.eq('Jonathon');
      expect(req.session.inv.ln).to.eq('Archer');
      expect(req.session.inv.e).to.eq('prequel@enterprise.net');
      expect(res.redirect).to.have.been.calledOnceWithExactly('/organisation/assignrole');
      expect(getDetailsStub).to.have.been.calledOnceWith('prequel@enterprise.net');
      expect(res.render).to.not.have.been.called;
    });
  });

  it('should render to error page if user is already exist', () => {
    const callController = async () => {
      await controller(req, res);
    };

    getDetailsStub.resolves({email: 'prequel@enterprise.net'});
    callController().then(() => {
      expect(res.render).to.have.been.calledOnceWithExactly('app/organisation/inviteusers/userExistError');
    });
  });
});
