const sinon = require('sinon');
const { expect } = require('chai');
const chai = require('chai');
const sinonChai = require('sinon-chai');

require('../global.test');
const CookieModel = require('../../common/models/Cookie.class');
const dataAccessApi = require('../../common/services/dataAccessApi');

const controller = require('../../app/home/get.controller');

describe('Home Get Controller', () => {
  let req;
  let res;
  let garApiStub;

  beforeEach(() => {
    chai.use(sinonChai);

    req = {
      session: {
        u: {
          dbId: 'abcde-12345',
          e: 'captain.kirk@enterprise.com',
          rl: 'Individual',
        },
      },
      query: { status: 'Draft', page: 1 },
    };
    res = {
      render: sinon.spy(),
    };

    garApiStub = sinon.stub(dataAccessApi.garApi, 'getGars');
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should render the page with no session data if gar api rejects', () => {
    garApiStub.rejects('garApi.getGars Example Reject');

    const cookie = new CookieModel(req);
    const callController = async () => {
      await controller(req, res);
    };

    callController()
      .then()
      .then(() => {
        expect(res.render).to.have.been.calledOnceWith('app/home/index', {
          cookie,
          successHeader: undefined,
          successMsg: undefined,
          errors: [{ message: 'Failed to get GARs' }],
          statusTab: 'Draft',
        });
      });
  });

  it('should render the page with session data if ok', () => {
    const draftGarsApiResponse = {
      items: [
        { id: 'GAR-1', status: { name: 'Draft' } },
        { id: 'GAR-2', status: { name: 'Draft' } },
      ],
    };
    const submittedGarsApiResponse = {
      items: [
        { id: 'GAR-4', status: { name: 'Submitted' } },
        { id: 'GAR-5', status: { name: 'Submitted' } },
        { id: 'GAR-6', status: { name: 'Submitted' } },
      ],
    };
    const cacelledGarsApiResponse = {
      items: [
        { id: 'GAR-3', status: { name: 'Cancelled' } },
        { id: 'GAR-7', status: { name: 'Cancelled' } },
      ],
    };
    req.session.successHeader = 'Windows XP';
    req.session.successMsg = 'Task failed successfully.';

    garApiStub.onCall(0).resolves(draftGarsApiResponse);
    garApiStub.onCall(1).resolves(submittedGarsApiResponse);
    garApiStub.onCall(2).resolves(cacelledGarsApiResponse);

    const cookie = new CookieModel(req);

    const callController = async () => {
      await controller(req, res);
    };

    callController()
      .then()
      .then(() => {
        expect(res.render).to.have.been.calledOnceWith('app/home/index', {
          cookie,
          successHeader: 'Windows XP',
          successMsg: 'Task failed successfully.',
          statusTab: 'Draft',
          draftGars: draftGarsApiResponse,
          submittedGars: submittedGarsApiResponse,
          cancelledGars: cacelledGarsApiResponse,
        });
      });
  });
});
