/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */

const sinon = require('sinon');
const { expect } = require('chai');
const chai = require('chai');
const sinonChai = require('sinon-chai');

const CookieModel = require('../../../common/models/Cookie.class');
const tokenApi = require('../../../common/services/tokenApi');
const userApi = require('../../../common/services/userManageApi');
const emailService = require('../../../common/services/sendEmail');

const controller = require('../../../app/user/login/post.controller');

describe('User Login Post Controller', () => {
  let req; let res;

  beforeEach(() => {
    chai.use(sinonChai);

    // Example request and response objects with appropriate spies
    req = {
      body: {
        Username: 'ExampleUser',
        departureDate: null,
        departurePort: 'ZZZZ',
      },
      session: {
        gar: {
          id: 12345,
          voyageDeparture: {
            departureDay: 6,
            departureMonth: 6,
            departureYear: 2019,
          },
        },
        cookie: {},
      },
    };

    res = {
      render: sinon.stub(),
      redirect: sinon.stub(),
    };
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should fail validation on erroneous submit', async () => {
    const emptyRequest = {
      body: {
        Username: '',
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
    it('should return an error message for an unexpected message', () => {
      const apiResponse = {
        message: 'Unexpected message',
      };
      sinon.stub(emailService, 'send').resolves();
      sinon.stub(userApi, 'userSearch').resolves(JSON.stringify(apiResponse));

      // Promise chain, so controller call is wrapped into its own method
      const callController = async () => {
        await controller(req, res);
      };

      callController().then(() => {
        expect(emailService.send).to.not.have.been.called;
        // TODO: Resolve -> Resolve -> Resolve
        expect(res.render).to.have.been.calledWith('app/user/login/index');
      });
    });

    it('should send en email and go to the MFA screen', () => {
      const apiResponse = {
        message: 'No results found',
      };
      sinon.stub(emailService, 'send').resolves();
      sinon.stub(userApi, 'userSearch').resolves(JSON.stringify(apiResponse));

      // Promise chain, so controller call is wrapped into its own method
      const callController = async () => {
        await controller(req, res);
      };

      callController().then(() => {
        expect(emailService.send).to.have.been.called;
        // TODO: Resolve -> Resolve -> Resolve
        // expect(res.redirect).to.have.been.calledWith('/login/authenticate');
      });
    });

    it('should go to the MFA screen if email could not be sent', () => {
      const apiResponse = {
        message: 'No results found',
      };
      sinon.stub(emailService, 'send').rejects('Example Reject');
      sinon.stub(userApi, 'userSearch').resolves(JSON.stringify(apiResponse));

      // Promise chain, so controller call is wrapped into its own method
      const callController = async () => {
        await controller(req, res);
      };

      callController().then(() => {
        expect(emailService.send).to.have.been.called;
        // TODO: Resolve -> Resolve -> Reject
        // expect(res.redirect).to.have.been.calledWith('/login/authenticate');
        expect(res.redirect).to.have.been.called;
      });
    });
  });

  describe('UserAPI resolves with a verified user', () => {
    it('should go to the next screen after creating a token', () => {
      const expectedCookie = new CookieModel(req);
      expectedCookie.setUserDbId(123);
      expectedCookie.setUserFirstName('Darth');
      const apiResponse = {
        state: 'verified',
        userId: 123,
        firstName: 'Darth',
      };
      sinon.stub(tokenApi, 'setMfaToken').resolves();
      sinon.stub(emailService, 'send');
      sinon.stub(userApi, 'userSearch').resolves(JSON.stringify(apiResponse));

      // Promise chain, so controller call is wrapped into its own method
      const callController = async () => {
        await controller(req, res);
      };

      callController().then(() => {
        expect(emailService.send).to.not.have.been.called;
        expect(res.redirect).to.have.been.calledWith('app/user/login/index');
      });
    });

    it('should return to the login page with an error message if token is not created', () => {
      const expectedCookie = new CookieModel(req);
      expectedCookie.setUserDbId(123);
      expectedCookie.setUserFirstName('Darth');
      const apiResponse = {
        state: 'verified',
        userId: 123,
        firstName: 'Darth',
      };
      sinon.stub(tokenApi, 'setMfaToken').rejects('Example Reject');
      sinon.stub(emailService, 'send');
      sinon.stub(userApi, 'userSearch').resolves(JSON.stringify(apiResponse));

      // Promise chain, so controller call is wrapped into its own method
      const callController = async () => {
        await controller(req, res);
      };

      callController().then(() => {
        expect(emailService.send).to.not.have.been.called;
        // TODO: Resolve -> Resolve -> Reject
        // expect(res.render).to.have.been.called;
      });
    });
  });

  describe('UserAPI resolves with an unverified user', () => {
    it('should return the login page with variables', () => {
      const expectedCookie = new CookieModel(req);
      expectedCookie.setUserDbId(123);
      expectedCookie.setUserFirstName('Darth');
      const apiResponse = {
        state: 'unverified',
        userId: 123,
        firstName: 'Darth',
      };
      sinon.stub(userApi, 'userSearch').resolves(JSON.stringify(apiResponse));

      // Promise chain, so controller call is wrapped into its own method
      const callController = async () => {
        await controller(req, res);
      };

      callController().then(() => {
        expect(res.render).to.have.been.calledWith('app/user/login/index', { cookie: expectedCookie, unverified: true });
      });
    });
  });
});
