const sinon = require('sinon');
const { expect } = require('chai');
const chai = require('chai');
const sinonChai = require('sinon-chai');

require('../../global.test');
const CookieModel = require('../../../common/models/Cookie.class');
const { personApi } = require('../../../common/services/dataAccessApi');

const settings = require('../../../common/config/index');
const configMock = {
  ...settings,
};

const controller = require('../../../app/user/viewDetails/get.controller', {
  '../../../common/config/index': configMock,
});

// TODO: Most of this logic handles obtaining people, which are not
// displayed on the resulting template! These unit tests are to reduce
// regressions should any code end up not running.
describe('User View Details Get Controller', () => {
  let req;
  let res;
  let personApiStub;
  const indexPage = 'app/user/viewDetails/index';

  beforeEach(() => {
    chai.use(sinonChai);

    req = {
      body: {},
      session: {
        u: { dbId: 'USER-ID-1' },
      },
    };

    res = {
      render: sinon.spy(),
    };

    personApiStub = sinon.stub(personApi, 'getPeople');
  });

  afterEach(() => {
    sinon.restore();
  });

  ['http_error', 'network_error', 'timeout_error'].forEach((type) => {
    it(`renders the fetch error on a ${type}`, async () => {
      personApiStub.rejects(
        Object.assign(new Error('Request failed'), { type, status: 503, body: { message: 'Unavailable' } })
      );

      await controller(req, res);

      expect(res.render).to.have.been.calledOnceWithExactly(indexPage, {
        cookie: new CookieModel(req),
        errors: [{ message: 'There was a problem fetching data' }],
        ONE_LOGIN_ACCOUNT_URL: settings.ONE_LOGIN_ACCOUNT_URL,
      });
    });
  });

  it('should redirect with errors if api rejects', () => {
    const cookie = new CookieModel(req);
    personApiStub.rejects(new Error('Unavailable'));

    const callController = async () => {
      await controller(req, res);
    };

    return callController()
      .then()
      .then(() => {
        expect(personApiStub).to.have.been.calledOnceWithExactly('USER-ID-1', 'individual');
        expect(res.render).to.have.been.calledOnceWithExactly(indexPage, {
          cookie,
          errors: [{ message: 'There was a problem fetching data' }],
          ONE_LOGIN_ACCOUNT_URL: settings.ONE_LOGIN_ACCOUNT_URL,
        });
      });
  });

  describe('api returns ok', () => {
    let cookie;

    const personApiResponse = [
      { id: 'PERSON-1', firstName: 'Jessica' },
      { id: 'PERSON-2', firstName: 'Trish' },
    ];

    beforeEach(() => {
      cookie = new CookieModel(req);
      personApiStub.resolves(personApiResponse);
    });

    it('should display error message if set', () => {
      req.session.errMsg = { message: 'Example error message' };

      const callController = async () => {
        await controller(req, res);
      };

      return callController().then(() => {
        expect(req.session.errMsg).to.be.undefined;
        expect(personApiStub).to.have.been.calledOnceWithExactly('USER-ID-1', 'individual');
        expect(res.render).to.have.been.calledOnceWithExactly(indexPage, {
          cookie,
          savedPeople: personApiResponse,
          errors: [{ message: 'Example error message' }],
          ONE_LOGIN_ACCOUNT_URL: settings.ONE_LOGIN_ACCOUNT_URL,
        });
      });
    });

    it('should display success message if set', () => {
      req.session.successHeader = 'Successful header';
      req.session.successMsg = 'Example success message';

      const callController = async () => {
        await controller(req, res);
      };

      return callController().then(() => {
        expect(req.session.errMsg).to.be.undefined;
        expect(req.session.successHeader).to.be.undefined;
        expect(req.session.successMsg).to.be.undefined;
        expect(personApiStub).to.have.been.calledOnceWithExactly('USER-ID-1', 'individual');
        expect(res.render).to.have.been.calledOnceWithExactly(indexPage, {
          cookie,
          savedPeople: personApiResponse,
          successHeader: 'Successful header',
          successMsg: 'Example success message',
          ONE_LOGIN_ACCOUNT_URL: settings.ONE_LOGIN_ACCOUNT_URL,
        });
      });
    });

    it('should redirect with no messages if no parameters', () => {
      const callController = async () => {
        await controller(req, res);
      };

      return callController().then(() => {
        expect(req.session.errMsg).to.be.undefined;
        expect(req.session.successHeader).to.be.undefined;
        expect(req.session.successMsg).to.be.undefined;
        expect(personApiStub).to.have.been.calledOnceWithExactly('USER-ID-1', 'individual');
        expect(res.render).to.have.been.calledOnceWithExactly(indexPage, {
          cookie,
          savedPeople: personApiResponse,
          ONE_LOGIN_ACCOUNT_URL: settings.ONE_LOGIN_ACCOUNT_URL,
        });
      });
    });
  });
});
