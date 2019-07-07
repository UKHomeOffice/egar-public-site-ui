/* eslint-disable no-undef */

const sinon = require('sinon');
const { expect } = require('chai');
const chai = require('chai');
const sinonChai = require('sinon-chai');

const CookieModel = require('../../../common/models/Cookie.class');
const garApi = require('../../../common/services/garApi');

const controller = require('../../../app/garfile/arrival/get.controller');

describe('Arrival Get Controller', () => {
  let req; let res;

  beforeEach(() => {
    chai.use(sinonChai);

    // Example request and response objects with appropriate spies
    req = {
      body: {
        departureDate: null,
        departurePort: 'ZZZZ',
      },
      session: {},
    };

    res = {
      render: sinon.spy(),
    };
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should display a message if gar api rejects', async () => {
    const cookie = new CookieModel(req);
    sinon.stub(garApi, 'get').rejects('garApi.get Example Reject');

    const callController = async () => {
      await controller(req, res);
    };

    callController().then(() => {
      expect(res.render).to.have.been.calledWith('app/garfile/arrival/index', { cookie, errors: [{ message: 'There was a problem getting GAR information' }] });
    });
  });

  it('should set cookie values on response', async () => {
    apiResponse = JSON.stringify({
      arrivalDate: '2012-30-05',
      arrivalTime: '15:00',
      arrivalPort: 'LHR',
      arrivalLong: '',
      arrivalLat: '',
    });
    const cookie = new CookieModel(req);
    cookie.setGarId('12345');
    cookie.setGarArrivalVoyage(apiResponse);
    sinon.stub(garApi, 'get').resolves(apiResponse);

    const callController = async () => {
      await controller(req, res);
    };

    callController().then(() => {
      expect(garApi.get).to.have.been.calledWith('12345');
      expect(res.render).to.have.been.calledWith('app/garfile/arrival/index', { cookie });
    });
  });
});
