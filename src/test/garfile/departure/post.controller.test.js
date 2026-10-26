const sinon = require('sinon');
const { expect } = require('chai');
require('chai').use(require('sinon-chai'));
require('../../global.test');

const { garApi } = require('../../../common/services/dataAccessApi');
const CookieModel = require('../../../common/models/Cookie.class');
const controller = require('../../../app/garfile/departure/post.controller');

describe('Departure Post Controller', () => {
  let req;
  let res;
  let patch;

  beforeEach(() => {
    sinon.useFakeTimers({ now: new Date('2022-05-29T00:00:00Z'), toFake: ['Date'] });
    req = {
      body: {
        portChoice: 'No',
        departureLat: '45.100000',
        departureLong: '12.100000',
        departureDay: '30',
        departureMonth: '5',
        departureYear: '2022',
        departureHour: '15',
        departureMinute: '00',
        buttonClicked: 'Save and continue',
      },
      session: { gar: { id: '12345', status: 'Draft', voyageDeparture: {} } },
    };
    res = {
      redirect: sinon.spy(),
      render: sinon.spy(),
      locals: { gar: { garId: '12345', arrivalPort: 'LHR' } },
    };
    patch = sinon.stub(garApi, 'patch').resolves({});
  });

  afterEach(() => sinon.restore());

  function expectErrors(messages) {
    expect(res.redirect).not.to.have.been.called;
    expect(res.render).to.have.been.calledOnce;
    expect(res.render.firstCall.args[0]).to.equal('app/garfile/departure/index');
    expect(res.render.firstCall.args[1].cookie).to.deep.equal(new CookieModel(req));
    expect(res.render.firstCall.args[1].errors.map((error) => error.message)).to.deep.equal(messages);
  }

  it('requires a port choice without updating the GAR', async () => {
    delete req.body.portChoice;
    await controller(req, res);
    expect(patch).not.to.have.been.called;
    expectErrors(['Select whether the port code is known']);
  });

  it('requires a code when the port is known', async () => {
    req.body.portChoice = 'Yes';
    await controller(req, res);
    expect(patch).not.to.have.been.called;
    expectErrors(['The departure airport code must be entered']);
  });

  it('requires coordinates when the port is unknown', async () => {
    delete req.body.departureLat;
    delete req.body.departureLong;
    await controller(req, res);
    expect(patch).not.to.have.been.called;
    expectErrors([
      'Value entered is incorrect. Enter latitude to 6 decimal places',
      'Value entered is incorrect. Enter longitude to 6 decimal places',
    ]);
  });

  it('rejects the arrival port using the ownership-verified GAR', async () => {
    req.body.portChoice = 'Yes';
    req.body.departurePort = 'LHR';
    await controller(req, res);
    expect(patch).not.to.have.been.called;
    expectErrors(['Departure port must be different to arrival port']);
  });

  it('saves coordinates and continues to arrival using the verified GAR ID', async () => {
    req.session.gar.id = 'stale-session-id';
    await controller(req, res);
    expect(patch).to.have.been.calledOnceWithExactly('12345', 'Draft', {
      departureDate: '2022-5-30',
      departureTime: '15:00',
      departurePort: '45.100000 12.100000',
      departureLat: '45.100000',
      departureLong: '12.100000',
      departurePortChoice: 'No',
      departurePortDesc: undefined,
    });
    expect(res.render).not.to.have.been.called;
    expect(res.redirect).to.have.been.calledOnceWithExactly('/garfile/arrival');
  });

  it('clears coordinates for a known port and returns to the GAR view when saving', async () => {
    req.body.portChoice = 'Yes';
    req.body.departurePort = 'BFS';
    req.body.buttonClicked = 'Save';
    await controller(req, res);
    expect(patch).to.have.been.calledOnce;
    expect(patch.firstCall.args[2]).to.include({
      departurePort: 'BFS',
      departureLat: '',
      departureLong: '',
      departurePortChoice: 'Yes',
    });
    expect(res.render).not.to.have.been.called;
    expect(res.redirect).to.have.been.calledOnceWithExactly(307, '/garfile/view');
  });

  it('renders a message returned by the API instead of continuing', async () => {
    patch.resolves({ message: 'GAR does not exist' });
    await controller(req, res);
    expectErrors(['GAR does not exist']);
  });

  it('preserves the backend message on an HTTP rejection', async () => {
    patch.rejects(
      Object.assign(new Error('Bad Request'), {
        type: 'http_error',
        status: 400,
        body: { message: 'GAR does not exist' },
      })
    );
    await controller(req, res);
    expectErrors(['GAR does not exist']);
  });

  it('renders a generic error when saving fails without an HTTP message', async () => {
    patch.rejects(new Error('Connection unavailable'));
    await controller(req, res);
    expectErrors(['Failed to add to GAR']);
  });
});
