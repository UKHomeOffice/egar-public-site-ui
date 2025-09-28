/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */

import sinon from 'sinon';

import { expect } from 'chai';
import chai from 'chai';
import sinonChai from 'sinon-chai';
import '../../global.test.js';
import CookieModel from '../../../common/models/Cookie.class.js';
import tokenService from '../../../common/services/create-token.js';
import tokenApi from '../../../common/services/tokenApi.js';
import userApi from '../../../common/services/userManageApi.js';
import settings from '../../../common/config/index.js';
import ValidationRule from '../../../common/models/ValidationRule.class.js';
import validator from '../../../common/utils/validator.js';
import i18n from 'i18n';
import path from 'path';

i18n.configure({
  locales: ['en'],
  directory: path.join(__dirname, '../../../locales'),
  objectNotation: true,
  defaultLocale: 'en',
  register: global,
});

import controller from '../../../app/verify/mfa/post.controller.js';

describe('Verify MFA Post Controller', () => {
  let req; let res; let sessionSaveStub;

  beforeEach(() => {
    chai.use(sinonChai);

    req = {
      session: {
        u: {
          e: 'example@somewhere.com',
        },
        save: callback => callback(),
      },
      body: {
        mfaCode: 123456,
      },
    };

    res = {
      render: sinon.spy(),
      redirect: sinon.spy(),
    };

    sinon.stub(tokenService, 'generateHash').returns('Token123');
    sessionSaveStub = sinon.stub(req.session, 'save').callsArg(0);
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should render page with message on validation error', async () => {
    const emptyReq = {
      session: {},
      body: {
        mfaCode: '',
      },
    };
    sinon.stub(tokenApi, 'validateMfaToken');
    sinon.stub(tokenApi, 'updateMfaToken');
    sinon.stub(userApi, 'getDetails');
    settings.MFA_TOKEN_LENGTH = 20;
    const cookie = new CookieModel(emptyReq);

    const callController = async () => {
      await controller(emptyReq, res);
    };

    callController(emptyReq, res).then(() => {
      expect(tokenApi.validateMfaToken).to.not.have.been.called;
      expect(tokenApi.updateMfaToken).to.not.have.been.called;
      expect(sessionSaveStub).to.not.have.been.called;
      expect(res.render).to.have.been.calledOnceWithExactly('app/verify/mfa/index', {
        cookie, mfaTokenLength: 20, errors: [new ValidationRule(validator.notEmpty, 'mfaCode', '', 'Enter your code')],
      });
    });
  });

  it('should render page with message when token api rejects', async () => {
    sinon.stub(tokenApi, 'validateMfaToken').rejects('Example Reject');
    sinon.stub(tokenApi, 'updateMfaToken');
    sinon.stub(userApi, 'getDetails');
    settings.MFA_TOKEN_LENGTH = 20;
    const cookie = new CookieModel(req);

    // Promise chain, so controller call is wrapped into its own method
    const callController = async () => {
      await controller(req, res);
    };

    callController().then(() => {
      expect(tokenApi.validateMfaToken).to.have.been.calledOnceWithExactly('example@somewhere.com', 123456);
      expect(tokenApi.updateMfaToken).to.not.have.been.called;
      expect(res.render).to.not.have.been.called;
    }).then(() => {
      expect(tokenApi.validateMfaToken).to.have.been.calledOnceWithExactly('example@somewhere.com', 123456);
      expect(tokenApi.updateMfaToken).to.not.have.been.called;
      expect(sessionSaveStub).to.not.have.been.called;
      expect(res.render).to.have.been.calledOnceWithExactly('app/verify/mfa/index', {
        cookie, mfaTokenLength: 20, errors: [{ identifier: 'mfaCode', message: 'There was a problem verifying your token. Try again.' }],
      });
    });
  });

  describe('token api resolves', () => {
    it('should return message if valid but token api update rejects', async () => {
      sinon.stub(tokenApi, 'validateMfaToken').resolves(true);
      sinon.stub(tokenApi, 'updateMfaToken').rejects('tokenApi.updateMfaToken Example Reject');
      sinon.stub(userApi, 'getDetails');
      settings.MFA_TOKEN_LENGTH = 20;
      const cookie = new CookieModel(req);

      // Promise chain, so controller call is wrapped into its own method
      const callController = async () => {
        await controller(req, res);
      };

      callController().then().then().then(() => {
        expect(tokenApi.validateMfaToken).to.have.been.calledOnceWithExactly('example@somewhere.com', 123456);
        expect(tokenApi.updateMfaToken).to.have.been.called;
        expect(sessionSaveStub).to.not.have.been.called;
        expect(res.render).to.have.been.calledOnceWithExactly('app/verify/mfa/index', {
          cookie, mfaTokenLength: 20, errors: [{ identifier: 'mfaCode', message: 'There was a problem verifying your token. Try again.' }],
        });
      });
    });

    it('should return message if valid token api resolves but user api rejects', async () => {
      sinon.stub(tokenApi, 'validateMfaToken').resolves(true);
      sinon.stub(tokenApi, 'updateMfaToken').resolves();
      sinon.stub(userApi, 'getDetails').rejects('userApi.getDetails Example Reject');
      settings.MFA_TOKEN_LENGTH = 20;
      const cookie = new CookieModel(req);

      // Promise chain, so controller call is wrapped into its own method
      const callController = async () => {
        await controller(req, res);
      };

      // Lots of redundancy but is there to illustrate the chained promises
      // Mystery here is why the second and third block have the same
      // assertions. It could be the nested catches perhaps in the code
      callController().then(() => {
        expect(tokenApi.validateMfaToken).to.have.been.calledOnceWithExactly('example@somewhere.com', 123456);
        expect(tokenApi.updateMfaToken).to.have.been.called;
        expect(userApi.getDetails).to.not.have.been.called;
        expect(res.render).to.not.have.been.called;
      }).then(() => {
        expect(tokenApi.validateMfaToken).to.have.been.calledOnceWithExactly('example@somewhere.com', 123456);
        expect(tokenApi.updateMfaToken).to.have.been.called;
        expect(userApi.getDetails).to.have.been.called;
        expect(res.render).to.not.have.been.called;
      }).then(() => {
        expect(tokenApi.validateMfaToken).to.have.been.calledOnceWithExactly('example@somewhere.com', 123456);
        expect(tokenApi.updateMfaToken).to.have.been.called;
        expect(userApi.getDetails).to.have.been.called;
        expect(res.render).to.not.have.been.called;
      })
        .then(() => {
          expect(tokenApi.validateMfaToken).to.have.been.calledOnceWithExactly('example@somewhere.com', 123456);
          expect(tokenApi.updateMfaToken).to.have.been.called;
          expect(userApi.getDetails).to.have.been.called;
          expect(sessionSaveStub).to.not.have.been.called;
          expect(res.render).to.have.been.calledOnceWithExactly('app/verify/mfa/index', {
            cookie, mfaTokenLength: 20, errors: [{ identifier: 'mfaCode', message: 'There was a problem verifying your token. Try again.' }],
          });
        });
    });

    it('should successfully login', async () => {
      sinon.stub(tokenApi, 'validateMfaToken').resolves();
      sinon.stub(tokenApi, 'updateMfaToken').resolves();
      sinon.stub(userApi, 'getDetails').resolves({
        firstName: 'Darth',
        lastName: 'Vader',
        userId: 'dvader@empire.net',
        role: {
          name: 'INDIVIDUAL',
        },
        state: 'verified',
        organisation: null,
      });
      settings.MFA_TOKEN_LENGTH = 20;

      // Promise chain, so controller call is wrapped into its own method
      const callController = async () => {
        await controller(req, res);
      };

      // Lots of redundancy but is there to illustrate the chained promises
      // Mystery here is why the second and third block have the same
      // assertions. It could be the catches perhaps in the code
      callController().then(() => {
        expect(tokenApi.validateMfaToken).to.have.been.calledOnceWithExactly('example@somewhere.com', 123456);
        expect(tokenApi.updateMfaToken).to.have.been.called.calledOnceWithExactly('example@somewhere.com', 123456);
        expect(userApi.getDetails).to.not.have.been.called;
        expect(res.redirect).to.not.have.been.called;
      }).then(() => {
        expect(tokenApi.validateMfaToken).to.have.been.calledOnceWithExactly('example@somewhere.com', 123456);
        expect(tokenApi.updateMfaToken).to.have.been.called.calledOnceWithExactly('example@somewhere.com', 123456);
        expect(userApi.getDetails).to.have.been.called.calledOnceWithExactly('example@somewhere.com');
        expect(res.redirect).to.not.have.been.called;
      }).then(() => {
        expect(tokenApi.validateMfaToken).to.have.been.calledOnceWithExactly('example@somewhere.com', 123456);
        expect(tokenApi.updateMfaToken).to.have.been.called.calledOnceWithExactly('example@somewhere.com', 123456);
        expect(userApi.getDetails).to.have.been.calledOnceWithExactly('example@somewhere.com');
        expect(sessionSaveStub).to.have.been.called;
        expect(res.redirect).to.have.been.calledOnceWithExactly('/home');
      });
    });
  });

  afterEach(() => {
    sinon.reset();
  });
});
