const sinon = require('sinon');
const { expect } = require('chai');
const chai = require('chai');
const sinonChai = require('sinon-chai');

require('../global.test');
const CookieModel = require('../../common/models/Cookie.class');
const tokenApi = require('../../common/services/tokenApi');
const garApi = require('../../common/services/garApi');

const controller = require('../../app/home/get.controller');

describe('Home Get Controller', () => {
  let req;
  let res;
  let tokenApiStub;
  let garApiStub;
  let garApiStubCount;
  const pages = { page: 1, perPage: 50, status: 'Draft,Submitted,Cancelled' };

  beforeEach(() => {
    chai.use(sinonChai);

    req = {
      session: {
        u: { dbId: 'abcde-12345', e: 'captain.kirk@enterprise.com', rl: 'Individual' },
      },
      query: { status: 'Draft,Submitted,Cancelled', page: 1 },
    };
    res = {
      render: sinon.spy(),
    };

    tokenApiStub = sinon.stub(tokenApi, 'getLastLogin');
    garApiStub = sinon.stub(garApi, 'getGars');
    garApiStubCount = sinon.stub(garApi, 'getGarsCount');
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

    callController()
      .then()
      .then(() => {
        expect(tokenApiStub).to.have.been.calledOnceWithExactly('captain.kirk@enterprise.com');
        expect(garApiStub).to.not.have.been.called;
        expect(res.render).to.have.been.calledOnceWithExactly('app/home/index', {
          cookie,
          userSession: [],
        });
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

    callController()
      .then()
      .then(() => {
        expect(tokenApiStub).to.have.been.calledOnceWithExactly('captain.kirk@enterprise.com');
        expect(garApiStub).to.have.been.calledOnceWithExactly('abcde-12345', 'Individual', pages, undefined);
        expect(res.render).to.have.been.calledOnceWith('app/home/index', {
          cookie,
          successHeader: undefined,
          successMsg: undefined,
          errors: [{ message: 'Failed to get GARs' }],
          garsCountObj: {},
          statusTab: 'Draft,Submitted,Cancelled',
        });
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
    const apiResponseCount = { Draft: 28, Cancelled: 4, Submitted: 15 };
    req.session.successHeader = 'Windows XP';
    req.session.successMsg = 'Task failed successfully.';
    tokenApiStub.resolves({
      StatusChangedTimestamp: '2018-11-20',
    });
    garApiStub.resolves(JSON.stringify(apiResponse));
    garApiStubCount.resolves(apiResponseCount);
    const cookie = new CookieModel(req);

    const callController = async () => {
      await controller(req, res);
    };

    callController()
      .then()
      .then(() => {
        expect(tokenApiStub).to.have.been.calledOnceWithExactly('captain.kirk@enterprise.com');
        expect(garApiStub).to.have.been.calledOnceWithExactly('abcde-12345', 'Individual', pages, undefined);
        expect(res.render).to.have.been.calledOnceWith('app/home/index', {
          cookie,
          successHeader: 'Windows XP',
          successMsg: 'Task failed successfully.',
          userSession: { StatusChangedTimestamp: '2018-11-20' },
          garList: [
            { id: 'GAR-1', status: { name: 'Draft' } },
            { id: 'GAR-2', status: { name: 'Draft' } },
            { id: 'GAR-3', status: { name: 'Cancelled' } },
            { id: 'GAR-4', status: { name: 'Submitted' } },
            { id: 'GAR-5', status: { name: 'Submitted' } },
            { id: 'GAR-6', status: { name: 'Submitted' } },
          ],
          draftGars: undefined,
          submittedGars: undefined,
          cancelledGars: undefined,
          pageMetadata: {
            Draft: { page: 1, perPage: 10, totalPages: 3, totalItems: 28 },
            Cancelled: { page: 1, perPage: 10, totalPages: 1, totalItems: 4 },
            Submitted: { page: 1, perPage: 10, totalPages: 2, totalItems: 15 },
          },
          statusTab: 'Draft,Submitted,Cancelled',
          garsCountObj: { Draft: 28, Cancelled: 4, Submitted: 15 },
        });
      });
  });

  it('should render the page with session data if ok and with success messages', () => {
    const apiResponse = {
      items: [
        { id: 'GAR-1', status: { name: 'Draft' } },
        { id: 'GAR-2', status: { name: 'Draft' } },
      ],
    };
    const apiResponseCount = { Draft: 28, Cancelled: 4, Submitted: 15 };
    req.session.successHeader = 'Windows XP';
    req.session.successMsg = 'Task failed successfully.';
    tokenApiStub.resolves({
      StatusChangedTimestamp: '2018-11-20',
    });
    garApiStubCount.resolves(apiResponseCount);
    garApiStub.resolves(JSON.stringify(apiResponse));
    const cookie = new CookieModel(req);

    const callController = async () => {
      await controller(req, res);
    };

    callController()
      .then()
      .then(() => {
        expect(req.session.successHeader).to.be.undefined;
        expect(req.session.successMsg).to.be.undefined;
        expect(tokenApiStub).to.have.been.calledOnceWithExactly('captain.kirk@enterprise.com');
        expect(garApiStub).to.have.been.calledOnceWithExactly('abcde-12345', 'Individual', pages, undefined);
        expect(res.render).to.have.been.calledOnceWith('app/home/index', {
          cookie,
          successHeader: 'Windows XP',
          successMsg: 'Task failed successfully.',
          userSession: { StatusChangedTimestamp: '2018-11-20' },
          garList: [
            { id: 'GAR-1', status: { name: 'Draft' } },
            { id: 'GAR-2', status: { name: 'Draft' } },
          ],
          draftGars: undefined,
          submittedGars: undefined,
          cancelledGars: undefined,
          pageMetadata: {
            Draft: { page: 1, perPage: 10, totalPages: 3, totalItems: 28 },
            Cancelled: { page: 1, perPage: 10, totalPages: 1, totalItems: 4 },
            Submitted: { page: 1, perPage: 10, totalPages: 2, totalItems: 15 },
          },
          statusTab: 'Draft,Submitted,Cancelled',
          garsCountObj: { Draft: 28, Cancelled: 4, Submitted: 15 },
        });
      });
  });
});
