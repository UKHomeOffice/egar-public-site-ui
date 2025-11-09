/* eslint-disable no-undef */

const sinon = require('sinon');
const { expect } = require('chai');
const chai = require('chai');
const sinonChai = require('sinon-chai');

require('../../global.test');
const CookieModel = require('../../../common/models/Cookie.class');
const garApi = require('../../../common/services/garApi');

const controller = require('../../../app/garfile/departure/get.controller');

describe('Departure Get Controller', () => {
  let req;
  let res;

  beforeEach(() => {
    chai.use(sinonChai);

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
      expect(res.render).to.have.been.calledWith('app/garfile/departure/index', {
        cookie,
        errors: [{ message: 'There was a problem getting GAR information' }],
      });
    });
  });

  it('should set cookie values on response', async () => {
    apiResponse = JSON.stringify({
      departureDate: '2012-30-05',
      departureTime: '15:00',
      departurePort: 'LHR',
      departureLong: '',
      departureLat: '',
    });
    const cookie = new CookieModel(req);
    cookie.setGarId('12345');
    cookie.setGarDepartureVoyage(apiResponse);
    sinon.stub(garApi, 'get').resolves(apiResponse);

    const callController = async () => {
      await controller(req, res);
    };

    callController().then(() => {
      expect(garApi.get).to.have.been.calledWith('12345');
      expect(res.render).to.have.been.calledWith('app/garfile/departure/index', { cookie });
    });
  });

  it('should set cookie values on response, changing if port is ZZZZ', async () => {
    apiResponse = JSON.stringify({
      departureDate: '2012-30-05',
      departureTime: '15:00',
      departurePort: 'ZZZZ',
      departureLong: '12.4000',
      departureLat: '-4.1234',
    });
    const cookie = new CookieModel(req);
    cookie.setGarId('12345');
    cookie.setGarDepartureVoyage(apiResponse);
    cookie.session.gar.voyageDeparture.departurePort = 'YYYY';
    sinon.stub(garApi, 'get').resolves(apiResponse);

    const callController = async () => {
      await controller(req, res);
    };

    callController().then(() => {
      expect(garApi.get).to.have.been.calledWith('12345');
      expect(res.render).to.have.been.calledWith('app/garfile/departure/index', { cookie });
    });
  });
});
