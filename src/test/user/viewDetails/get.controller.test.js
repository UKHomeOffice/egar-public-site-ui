/* eslint-disable no-undef */
/* eslint-disable no-unused-expressions */

const sinon = require('sinon');
const { expect } = require('chai');
const chai = require('chai');
const sinonChai = require('sinon-chai');
const proxyquire = require('proxyquire');

require('../../global.test');
const CookieModel = require('../../../common/models/Cookie.class');
const craftApi = require('../../../common/services/craftApi');
const personApi = require('../../../common/services/personApi');

const settings = require('../../../common/config/index');
const configMock = {
  ...settings,
  ONE_LOGIN_SHOW_ONE_LOGIN: false,
};

const controller = require('../../../app/user/viewDetails/get.controller', {
  '../../../common/config/index': configMock
});

// TODO: Most of this logic handles obtaining craft and people, which are not
// displayed on the resulting template! These unit tests are to reduce
// regressions should any code end up not running.
describe('User View Details Get Controller', () => {
  let req; let res;
  let craftApiStub; let personApiStub;
  const indexPage = settings.ONE_LOGIN_SHOW_ONE_LOGIN ? 'app/user/viewDetails/index' : 'app/user/viewDetails/old_index';
  
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

    craftApiStub = sinon.stub(craftApi, 'getCrafts');
    personApiStub = sinon.stub(personApi, 'getPeople');
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should redirect with errors if api rejects', () => {
    const cookie = new CookieModel(req);
    personApiStub.resolves();

    const callController = async () => {
      await controller(req, res);
    };

    callController().then().then(() => {
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

    const personApiResponse = {
      items: [
        { id: 'PERSON-1', firstName: 'Jessica' },
        { id: 'PERSON-2', firstName: 'Trish' },
      ],
    };

    const craftApiResponse = {
      items: [
        { registration: 'G-ABCD', craftType: 'Hondajet', craftBase: 'OXF' },
      ],
    };

    beforeEach(() => {
      cookie = new CookieModel(req);
      cookie.setSavedCraft(craftApiResponse);

      craftApiStub.resolves(JSON.stringify(craftApiResponse));
      personApiStub.resolves(JSON.stringify(personApiResponse));
    });

    it('should display error message if set', () => {
      req.session.errMsg = { message: 'Example error message' };

      const callController = async () => {
        await controller(req, res);
      };

      callController().then(() => {
        expect(req.session.errMsg).to.be.undefined;
        expect(personApiStub).to.have.been.calledOnceWithExactly('USER-ID-1', 'individual');
        expect(res.render).to.have.been.calledOnceWithExactly(indexPage, {
          cookie,
          savedPeople: {
            items: [
              { id: 'PERSON-1', firstName: 'Jessica' },
              { id: 'PERSON-2', firstName: 'Trish' },
            ],
          },
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

      callController().then(() => {
        expect(req.session.errMsg).to.be.undefined;
        expect(req.session.successHeader).to.be.undefined;
        expect(req.session.successMsg).to.be.undefined;
        expect(personApiStub).to.have.been.calledOnceWithExactly('USER-ID-1', 'individual');
        expect(res.render).to.have.been.calledOnceWithExactly(indexPage, {
          cookie,
          savedPeople: {
            items: [
              { id: 'PERSON-1', firstName: 'Jessica' },
              { id: 'PERSON-2', firstName: 'Trish' },
            ],
          },
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

      callController().then(() => {
        expect(req.session.errMsg).to.be.undefined;
        expect(req.session.successHeader).to.be.undefined;
        expect(req.session.successMsg).to.be.undefined;
        expect(personApiStub).to.have.been.calledOnceWithExactly('USER-ID-1', 'individual');
        expect(res.render).to.have.been.calledOnceWithExactly(indexPage, {
          cookie,
          savedPeople: {
            items: [
              { id: 'PERSON-1', firstName: 'Jessica' },
              { id: 'PERSON-2', firstName: 'Trish' },
            ],
          },
          ONE_LOGIN_ACCOUNT_URL: settings.ONE_LOGIN_ACCOUNT_URL,
        });
      });
    });
  });
});
