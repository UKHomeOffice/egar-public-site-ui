const sinon = require('sinon');
const { expect } = require('chai');
require('chai').use(require('sinon-chai'));
require('../../global.test');

const { garApi } = require('../../../common/services/dataAccessApi');
const CookieModel = require('../../../common/models/Cookie.class');
const controller = require('../../../app/garfile/departure/get.controller');

describe('Departure Get Controller', () => {
  let req;
  let res;

  beforeEach(() => {
    req = { session: {} };
    res = { render: sinon.spy(), locals: { gar: { garId: '12345' } } };
  });

  afterEach(() => sinon.restore());

  it('displays an error if the GAR lookup rejects', async () => {
    sinon.stub(garApi, 'get').rejects(new Error('Connection unavailable'));
    await controller(req, res);
    expect(res.render).to.have.been.calledOnce;
    expect(res.render.firstCall.args[0]).to.equal('app/garfile/departure/index');
    expect(res.render.firstCall.args[1].errors).to.deep.equal([
      { message: 'There was a problem getting GAR information' },
    ]);
  });

  it('loads a decoded GAR into the departure form', async () => {
    const get = sinon.stub(garApi, 'get').resolves({
      departureDate: '2022-05-30',
      departureTime: '15:00:00',
      departurePort: 'LHR',
      departureLong: '',
      departureLat: '',
    });
    await controller(req, res);
    expect(get).to.have.been.calledOnceWithExactly('12345');
    expect(req.session.gar.voyageDeparture).to.include({
      departureDate: '2022-05-30',
      departureTime: '15:00:00',
      departurePort: 'LHR',
      departureLat: '',
      departureLong: '',
      departurePortChoice: 'Yes',
    });
    expect(res.render).to.have.been.calledOnceWithExactly('app/garfile/departure/index', {
      cookie: new CookieModel(req),
    });
  });

  it('loads coordinates as an unknown port rather than a port code', async () => {
    sinon.stub(garApi, 'get').resolves({
      departureDate: '2022-05-30',
      departureTime: '15:00:00',
      departurePort: 'ZZZZ',
      departureLong: '12.400000',
      departureLat: '-4.123400',
    });
    await controller(req, res);
    expect(req.session.gar.voyageDeparture).to.include({
      departurePortChoice: 'No',
      departureLong: '12.400000',
      departureLat: '-4.123400',
    });
    expect(res.render).to.have.been.calledOnce;
  });
});
