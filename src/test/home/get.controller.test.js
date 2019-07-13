/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */

const sinon = require('sinon');
const { expect } = require('chai');
const chai = require('chai');
const sinonChai = require('sinon-chai');

const CookieModel = require('../../common/models/Cookie.class');
const tokenApi = require('../../common/services/tokenApi');
const garApi = require('../../common/services/garApi');

const controller = require('../../app/home/get.controller');

describe('Home Get Controller', () => {
  let req; let res;
  let tokenApiStub; let garApiStub;

  beforeEach(() => {
    chai.use(sinonChai);
    process.on('unhandledRejection', (error) => {
      chai.assert.fail(`Unhandled rejection encountered: ${error}`);
    });

    req = {
      session: {
        u: { dbId: 'abcde-12345', e: 'captain.kirk@enterprise.com', rl: 'Individual' },
      },
    };
    res = {
      render: sinon.spy(),
    };

    tokenApiStub = sinon.stub(tokenApi, 'getLastLogin');
    garApiStub = sinon.stub(garApi, 'getGars');
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should render the page with no session data if token api rejects', () => {
    tokenApiStub.rejects('tokenApi.getLastLogin Example Reject');

    const cookie = new CookieModel(req);

    const callController = async () => {
      await controller(req, res);
    };

    callController().then().then(() => {
      expect(tokenApiStub).to.have.been.calledOnceWithExactly('captain.kirk@enterprise.com');
      expect(garApiStub).to.not.have.been.called;
      expect(res.render).to.have.been.calledOnceWithExactly('app/home/index', { cookie, userSession: [] });
    });
  });

  it('should render the page with no session data if gar api rejects', () => {
    tokenApiStub.resolves({
      StatusChangedTimestamp: '2018-11-20',
    });
    garApiStub.rejects('garApi.getGars Example Reject');

    const cookie = new CookieModel(req);

    const callController = async () => {
      await controller(req, res);
    };

    callController().then().then(() => {
      expect(tokenApiStub).to.have.been.calledOnceWithExactly('captain.kirk@enterprise.com');
      expect(garApiStub).to.have.been.calledOnceWithExactly('abcde-12345', 'Individual', undefined);
      expect(res.render).to.have.been.calledOnceWith('app/home/index', { cookie, errors: [{ message: 'Failed to get GARs' }] });
    });
  });

  it('should render the page with session data if ok', () => {
    const apiResponse = {
      items: [
        { id: 'GAR-1', status: { name: 'Draft' } },
        { id: 'GAR-2', status: { name: 'Draft' } },
        { id: 'GAR-3', status: { name: 'Cancelled' } },
        { id: 'GAR-4', status: { name: 'Submitted' } },
        { id: 'GAR-5', status: { name: 'Submitted' } },
        { id: 'GAR-6', status: { name: 'Submitted' } },
      ],
    };
    tokenApiStub.resolves({
      StatusChangedTimestamp: '2018-11-20',
    });
    garApiStub.resolves(JSON.stringify(apiResponse));

    const cookie = new CookieModel(req);

    const callController = async () => {
      await controller(req, res);
    };

    callController().then().then(() => {
      expect(tokenApiStub).to.have.been.calledOnceWithExactly('captain.kirk@enterprise.com');
      expect(garApiStub).to.have.been.calledOnceWithExactly('abcde-12345', 'Individual', undefined);
      expect(res.render).to.have.been.calledOnceWith('app/home/index', {
        cookie,
        userSession: { StatusChangedTimestamp: '2018-11-20' },
        draftGars: [
          { id: 'GAR-1', status: { name: 'Draft' } },
          { id: 'GAR-2', status: { name: 'Draft' } },
        ],
        submittedGars: [
          { id: 'GAR-4', status: { name: 'Submitted' } },
          { id: 'GAR-5', status: { name: 'Submitted' } },
          { id: 'GAR-6', status: { name: 'Submitted' } },
        ],
        cancelledGars: [{ id: 'GAR-3', status: { name: 'Cancelled' } }],
      });
    });
  });
});
