/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */

const sinon = require('sinon');
const { expect } = require('chai');
const chai = require('chai');
const sinonChai = require('sinon-chai');

const CookieModel = require('../../common/models/Cookie.class');
const personApi = require('../../common/services/personApi');

const controller = require('../../app/people/get.controller');

describe('People Get Controller', () => {
  let req; let res;

  beforeEach(() => {
    chai.use(sinonChai);
    process.on('unhandledRejection', (error) => {
      chai.assert.fail(`Unhandled rejection encountered: ${error}`);
    });

    req = {
      session: {
        u: { dbId: 'USER-DB-ID-1' },
      },
    };
    res = {
      render: sinon.spy(),
    };
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should render with error if api rejects', () => {
    const cookie = new CookieModel(req);
    sinon.stub(personApi, 'getPeople').rejects('garApi.getPeople Example Reject');

    const callController = async () => {
      await controller(req, res);
    };

    callController().then(() => {
      expect(personApi.getPeople).to.have.been.calledWith('USER-DB-ID-1', 'individual');
      expect(res.render).to.have.been.calledWith('app/people/index', {
        cookie, errors: [{ message: 'Failed to get saved people' }],
      });
    });
  });

  it('should render the message if api returns one', () => {
    const cookie = new CookieModel(req);
    sinon.stub(personApi, 'getPeople').resolves(JSON.stringify({
      message: 'User not found',
    }));

    const callController = async () => {
      await controller(req, res);
    };

    callController().then(() => {
      expect(personApi.getPeople).to.have.been.calledWith('USER-DB-ID-1', 'individual');
      expect(res.render).to.have.been.calledWith('app/people/index', {
        cookie, errors: [{ message: 'Failed to get saved people' }],
      });
    });
  });

  describe('api returns people', () => {
    const apiResponse = [
      {
        personId: '1', peopleType: { name: 'Captain' }, firstName: 'James', lastName: 'Kirk',
      },
      {
        personId: '2', peopleType: { name: 'Crew' }, firstName: 'S\'chn T\'gai', lastName: 'Spock',
      },
    ];

    it('should include error messages if set in the session', () => {
      req.session.errMsg = { message: 'Example Error Message' };
      const cookie = new CookieModel(req);
      sinon.stub(personApi, 'getPeople').resolves(JSON.stringify(apiResponse));

      const callController = async () => {
        await controller(req, res);
      };

      callController().then(() => {
        expect(req.session.errMsg).to.be.undefined;
        expect(personApi.getPeople).to.have.been.calledWith('USER-DB-ID-1', 'individual');
        expect(res.render).to.have.been.calledWith('app/people/index', {
          cookie, people: apiResponse, errors: [{ message: 'Example Error Message' }],
        });
      });
    });

    it('should include success message if set in the session', () => {
      req.session.successMsg = 'Example Success Message';
      req.session.successHeader = 'Successful Header';
      const cookie = new CookieModel(req);
      sinon.stub(personApi, 'getPeople').resolves(JSON.stringify(apiResponse));

      const callController = async () => {
        await controller(req, res);
      };

      callController().then(() => {
        expect(req.session.successMsg).to.be.undefined;
        expect(req.session.successHeader).to.be.undefined;
        expect(personApi.getPeople).to.have.been.calledWith('USER-DB-ID-1', 'individual');
        expect(res.render).to.have.been.calledWith('app/people/index', {
          cookie, people: apiResponse, successHeader: 'Successful Header', successMsg: 'Example Success Message',
        });
      });
    });

    it('should render the page as appropriate', () => {
      const cookie = new CookieModel(req);
      sinon.stub(personApi, 'getPeople').resolves(JSON.stringify(apiResponse));

      const callController = async () => {
        await controller(req, res);
      };

      callController().then(() => {
        expect(req.session.errMsg).to.be.undefined;
        expect(req.session.successMsg).to.be.undefined;
        expect(req.session.successHeader).to.be.undefined;
        expect(personApi.getPeople).to.have.been.calledWith('USER-DB-ID-1', 'individual');
        expect(res.render).to.have.been.calledWith('app/people/index', {
          cookie, people: apiResponse,
        });
      });
    });
  });
});
