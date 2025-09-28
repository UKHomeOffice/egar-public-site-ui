/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */

import sinon from 'sinon';
import { expect } from 'chai';
import chai from 'chai';
import sinonChai from 'sinon-chai';
import esmock from 'esmock';
import '../../global.test.js';
import CookieModel from '../../../common/models/Cookie.class.js';
import tokenApi from '../../../common/services/tokenApi.js';
import userApi from '../../../common/services/userManageApi.js';
import emailService from '../../../common/services/sendEmail.js';
import oneLoginUtils from '../../../common/utils/oneLoginAuth.js';
import controller from '../../../app/user/login/post.controller.js';
import ValidationRule from '../../../common/models/ValidationRule.class.js';
import oneLoginApi from '../../../common/utils/oneLoginAuth.js';
import config from '../../../common/config/index.js';
import { ONE_LOGIN_SHOW_ONE_LOGIN } from '../../../common/config/index.js';

describe('User Login Post Controller', () => {
  let req; let res;
  let oneLoginStub;
  let configMock;

  beforeEach(() => {
    chai.use(sinonChai);

    req = {
      body: {
        username: 'ExampleUser',
        departureDate: null,
        departurePort: 'ZZZZ',
      },
      session: {
        cookie: {},
        gar: {
          id: 12345,
          voyageDeparture: {
            departureDay: 6,
            departureMonth: 6,
            departureYear: 2019,
          },
        },
      },
    };

    res = {
      render: sinon.stub(),
      redirect: sinon.stub(),
      cookie: sinon.stub(),
    };

    configMock = {
      ...config,
      ONE_LOGIN_POST_MIGRATION: false,
      ONE_LOGIN_SHOW_ONE_LOGIN: false,
      HOMEPAGE_MESSAGE: 'Welcome to the new service',
    };

    oneLoginStub = sinon.stub(oneLoginUtils, 'getOneLoginAuthUrl').returns("https://dummy.com");
  });

  afterEach(() => {
    sinon.reset();
    sinon.restore();
  });

  it('should fail validation on empty submit', async () => {
    const emptyRequest = {
      body: {
        username: '',
      },
      session: {
        cookie: {},
      },
    };
    try {
      await controller(emptyRequest, res);
    } catch (err) {
      expect(err).to.eq('Validation error when logging in');
      expect(res.render).to.have.been.calledWith('app/user/login/index');
    }
  });

  describe('UserAPI rejects', () => {
    it('should return the login page with error variable', async () => {
      sinon.stub(userApi, 'userSearch').rejects('Example Reject');

      try {
        await controller(req, res);
      } catch (err) {
        expect(err).to.eq('Example Reject');
        expect(res.render).to.have.been.calledWith('app/user/login/index', { errors: [{ message: 'There was a problem sending your code. Please try again.' }] });
      }
    });
  });

  // TODO: These unit tests represent the functionality as it currently is, and
  // should highlight that this needs addressing
  describe('UserAPI resolves with no results', () => {
    it('should return an error message for an unexpected message', async () => {
      const apiResponse = {
        message: 'Unexpected message',
      };
      sinon.stub(emailService, 'send').resolves();
      sinon.stub(userApi, 'userSearch').resolves(JSON.stringify(apiResponse));

      await controller(req, res);

      expect(emailService.send).to.not.have.been.called;
      expect(res.render).to.have.been.calledWith('app/user/login/index');
    });

    it('should return unregistered back to the page if no user found', async () => {
      const cookie = new CookieModel(req);
      cookie.setUserVerified(false);
      const apiResponse = {
        message: 'No results found',
      };

      sinon.stub(emailService, 'send').resolves();
      sinon.stub(userApi, 'userSearch').resolves(JSON.stringify(apiResponse));

      const mockedController = await esmock('../../../app/user/login/post.controller.js', {
        '../../../common/config/index.js': configMock,
      });

      await mockedController(req, res);

      expect(emailService.send).to.not.have.been.called;
      expect(res.redirect).to.not.have.been.called;
      expect(res.render).to.have.been.calledOnceWithExactly('app/user/login/index', { cookie, unregistered: true, oneLoginAuthUrl: null });
    });
  });

  describe('UserAPI resolves with a verified user', () => {
    it('should go to the next screen after creating a token', async () => {
      const expectedCookie = new CookieModel(req);
      expectedCookie.setUserDbId(123);
      expectedCookie.setUserFirstName('Darth');
      const apiResponse = {
        state: 'verified',
        userId: 123,
        firstName: 'Darth',
      };
      sinon.stub(tokenApi, 'setMfaToken').resolves();
      sinon.stub(emailService, 'send').resolves();
      sinon.stub(userApi, 'userSearch').resolves(JSON.stringify(apiResponse));

      await controller(req, res);

      expect(userApi.userSearch).to.have.been.calledWith('ExampleUser');
      expect(emailService.send).to.have.been.called;
      expect(res.redirect).to.have.been.calledWith('/login/authenticate');
    });

    it('should return to the login page with an error message if token is not created', async () => {
      const expectedCookie = new CookieModel(req);
      expectedCookie.setUserDbId(123);
      expectedCookie.setUserFirstName('Darth');
      const apiResponse = {
        state: 'verified',
        userId: 123,
        firstName: 'Darth',
      };
      sinon.stub(tokenApi, 'setMfaToken').rejects('Example Reject');
      sinon.stub(emailService, 'send').resolves();
      sinon.stub(userApi, 'userSearch').resolves(JSON.stringify(apiResponse));

      try {
        await controller(req, res);
      } catch (err) {
        expect(emailService.send).to.not.have.been.called;
        expect(res.render).to.have.been.calledWith('app/user/login/index');
      }
    });
  });

  describe('UserAPI resolves with an unverified user', () => {
    it('should return the login page with variables', async () => {
      const expectedCookie = new CookieModel(req);
      expectedCookie.setUserDbId(123);
      expectedCookie.setUserFirstName('Darth');
      const apiResponse = {
        state: 'unverified',
        userId: 123,
        firstName: 'Darth',
      };
      sinon.stub(userApi, 'userSearch').resolves(JSON.stringify(apiResponse));

      await controller(req, res);

      expect(res.render).to.have.been.calledWith('app/user/login/index', { cookie: expectedCookie, unverified: true });
    });
  });
});