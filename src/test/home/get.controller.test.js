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
  const pages = { page: 1, per_page: 10, status: 'Draft' };

  beforeEach(() => {
    chai.use(sinonChai);

    req = {
      session: {
        u: { dbId: 'abcde-12345', e: 'captain.kirk@enterprise.com', rl: 'Individual' },
      },
      query: { status: 'Draft' },
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
          garsCountObj: 0,
          statusTab: 'Draft',
        });
      });
  });

  it('should render the page with session data if ok', () => {
    const apiResponse = {
      items: [
        { id: 'GAR-1', status: { name: 'Draft' } },
        { id: 'GAR-2', status: { name: 'Draft' } },
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
          ],
          pages: 10,
          statusTab: 'Draft',
          garsCountObj: { Draft: 2, Cancelled: 0, Submitted: 0 },
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
    req.session.successHeader = 'Windows XP';
    req.session.successMsg = 'Task failed successfully.';
    tokenApiStub.resolves({
      StatusChangedTimestamp: '2018-11-20',
    });
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
          pages: { page: 1, perPage: 10, totalPages: 2, totalItems: 12 },
          garList: [
            { id: 'GAR-1', status: { name: 'Draft' } },
            { id: 'GAR-2', status: { name: 'Draft' } },
          ],
          garsCountObj: { Draft: 1, Cancelled: 1, Submitted: 0 },
        });
      });
  });
});
