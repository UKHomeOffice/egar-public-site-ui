/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */

const sinon = require('sinon');
const { expect } = require('chai');
const chai = require('chai');
const sinonChai = require('sinon-chai');

const CookieModel = require('../../../common/models/Cookie.class');
const validator = require('../../../common/utils/validator');
const ValidationRule = require('../../../common/models/ValidationRule.class');
const orgApi = require('../../../common/services/organisationApi');

const controller = require('../../../app/organisation/editusers/post.controller');

describe('Organisation Edit Users Post Controller', () => {
  let req; let res; let orgApiStub; let sessionSaveStub;

  beforeEach(() => {
    chai.use(sinonChai);
    process.on('unhandledRejection', (error) => {
      chai.assert.fail(`Unhandled rejection encountered: ${error}`);
    });

    req = {
      body: {
        firstName: 'Kylo',
        lastName: 'Ren',
        role: 'Individual',
      },
      session: {
        editUserId: 'EDIT-BADDIE-1',
        u: { dbId: 'BADDIE-1' },
        org: { i: 'FIRST-ORDER-ID' },
        save: callback => callback(),
      },
    };
    res = {
      redirect: sinon.stub(),
      render: sinon.stub(),
    };

    orgApiStub = sinon.stub(orgApi, 'editUser');
    sessionSaveStub = sinon.stub(req.session, 'save').callsArg(0);
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('validations', () => {
    it('should render messages when strings empty', () => {
      req.body.firstName = '';
      req.body.lastName = '';
      req.body.role = '';
      cookie = new CookieModel(req);

      const callController = async () => {
        await controller(req, res);
      };

      callController().then(() => {
        expect(orgApiStub).to.not.have.been.called;
        expect(sessionSaveStub).to.not.have.been.called;
        expect(res.redirect).to.not.have.been.called;
        expect(res.render).to.have.been.calledOnceWithExactly('app/organisation/editusers/index', {
          cookie,
          orgUser: {
            firstName: '',
            lastName: '',
            role: '',
            userId: 'EDIT-BADDIE-1',
          },
          errors: [
            new ValidationRule(validator.notEmpty, 'firstName', req.body.firstName, 'Enter a given name'),
            new ValidationRule(validator.notEmpty, 'lastName', req.body.lastName, 'Enter a surname'),
            new ValidationRule(validator.notEmpty, 'role', req.body.role, 'Provide a user role'),
          ],
        });
      });
    });

    it('should render messages when strings too long', () => {
      req.body.firstName = 'abcdefghijklmnopqrstuvwxyzabcdefghijk';
      req.body.lastName = 'abcdefghijklmnopqrstuvwxyzabcdefghij';
      cookie = new CookieModel(req);

      const callController = async () => {
        await controller(req, res);
      };

      callController().then(() => {
        expect(orgApiStub).to.not.have.been.called;
        expect(sessionSaveStub).to.not.have.been.called;
        expect(res.redirect).to.not.have.been.called;
        expect(res.render).to.have.been.calledOnceWithExactly('app/organisation/editusers/index', {
          cookie,
          orgUser: {
            firstName: 'abcdefghijklmnopqrstuvwxyzabcdefghijk',
            lastName: 'abcdefghijklmnopqrstuvwxyzabcdefghij',
            role: 'Individual',
            userId: 'EDIT-BADDIE-1',
          },
          errors: [
            new ValidationRule(validator.isValidStringLength, 'firstName', 'abcdefghijklmnopqrstuvwxyzabcdefghijk', 'Given name must be 35 characters or less'),
            new ValidationRule(validator.isValidStringLength, 'lastName', 'abcdefghijklmnopqrstuvwxyzabcdefghij', 'Surname must be 35 characters or less'),
          ],
        });
      });
    });
  });

  it('should redirect with message if api rejects', () => {
    orgApiStub.rejects('orgApi.editUser Example Reject');

    const callController = async () => {
      await controller(req, res);
    };

    callController().then().then(() => {
      expect(orgApiStub).to.have.been.calledOnceWithExactly('BADDIE-1', 'FIRST-ORDER-ID', {
        userId: 'EDIT-BADDIE-1',
        firstName: 'Kylo',
        lastName: 'Ren',
        role: 'Individual',
      });
      expect(req.session.errMsg).to.eql({ message: 'Failed to update user details. Try again' });
      expect(sessionSaveStub).to.have.been.called;
      expect(res.redirect).to.have.been.calledOnceWithExactly('/organisation');
      expect(res.render).to.not.have.been.called;
    });
  });

  it('should redirect with message if api returns message', () => {
    orgApiStub.resolves(JSON.stringify({
      message: 'User ID not found',
    }));

    const callController = async () => {
      await controller(req, res);
    };

    callController().then().then(() => {
      expect(orgApiStub).to.have.been.calledOnceWithExactly('BADDIE-1', 'FIRST-ORDER-ID', {
        userId: 'EDIT-BADDIE-1',
        firstName: 'Kylo',
        lastName: 'Ren',
        role: 'Individual',
      });
      expect(req.session.errMsg).to.eql({ message: 'You do not have the permissions to edit this user or perform this action' });
      expect(sessionSaveStub).to.have.been.called;
      expect(res.redirect).to.have.been.calledOnceWithExactly('/organisation');
      expect(res.render).to.not.have.been.called;
    });
  });

  it('should redirect with no message if api ok', () => {
    orgApiStub.resolves(JSON.stringify({}));

    const callController = async () => {
      await controller(req, res);
    };

    callController().then().then(() => {
      expect(orgApiStub).to.have.been.calledOnceWithExactly('BADDIE-1', 'FIRST-ORDER-ID', {
        userId: 'EDIT-BADDIE-1',
        firstName: 'Kylo',
        lastName: 'Ren',
        role: 'Individual',
      });
      expect(req.session.errMsg).to.be.undefined;
      expect(sessionSaveStub).to.have.been.called;
      expect(res.redirect).to.have.been.calledOnceWithExactly('/organisation');
      expect(res.render).to.not.have.been.called;
    });
  });
});
