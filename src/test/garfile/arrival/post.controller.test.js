const sinon = require('sinon');
const { expect } = require('chai');
require('chai').use(require('sinon-chai'));
require('../../global.test');

const { garApi } = require('../../../common/services/dataAccessApi');
const CookieModel = require('../../../common/models/Cookie.class');
const controller = require('../../../app/garfile/arrival/post.controller');

describe('Arrival Post Controller', () => {
  let req;
  let res;
  let patch;

  beforeEach(() => {
    sinon.useFakeTimers({ now: new Date('2022-05-11T00:00:00Z'), toFake: ['Date'] });
    req = {
      body: {
        portChoice: 'No',
        arrivalLat: '45.100000',
        arrivalLong: '12.100000',
        arrivalDay: '30',
        arrivalMonth: '5',
        arrivalYear: '2022',
        arrivalHour: '15',
        arrivalMinute: '00',
        buttonClicked: 'Save and continue',
      },
      session: { gar: { id: 'ABCDEFGH', status: 'Draft', voyageArrival: {} } },
    };
    res = {
      redirect: sinon.spy(),
      render: sinon.spy(),
      locals: { gar: { garId: 'ABCDEFGH', departurePort: 'BFS' } },
    };
    patch = sinon.stub(garApi, 'patch').resolves({});
  });

  afterEach(() => sinon.restore());

  function expectErrors(messages) {
    expect(res.redirect).not.to.have.been.called;
    expect(res.render).to.have.been.calledOnce;
    expect(res.render.firstCall.args[0]).to.equal('app/garfile/arrival/index');
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
    req.body.arrivalPort = '';
    await controller(req, res);
    expect(patch).not.to.have.been.called;
    expectErrors(['The arrival airport code must be entered']);
  });

  it('rejects an arrival date more than a month away', async () => {
    req.body.arrivalYear = '2024';
    await controller(req, res);
    expect(patch).not.to.have.been.called;
    expectErrors(['Arrival date must be in the future and within a month from now']);
  });

  it('rejects a past arrival date', async () => {
    req.body.arrivalYear = '2010';
    await controller(req, res);
    expect(patch).not.to.have.been.called;
    expectErrors(['Arrival date must be in the future and within a month from now']);
  });

  it('requires coordinates when the port is unknown', async () => {
    delete req.body.arrivalLat;
    delete req.body.arrivalLong;
    await controller(req, res);
    expect(patch).not.to.have.been.called;
    expectErrors([
      'Value entered is incorrect. Enter latitude to 6 decimal places',
      'Value entered is incorrect. Enter longitude to 6 decimal places',
    ]);
  });

  it('rejects the departure port using the ownership-verified GAR', async () => {
    req.body.portChoice = 'Yes';
    req.body.arrivalPort = 'BFS';
    await controller(req, res);
    expect(patch).not.to.have.been.called;
    expectErrors(['Arrival port must be different to departure port']);
  });

  it('requires a UK port when both ports are known', async () => {
    res.locals.gar.departurePort = 'LFAT';
    req.body.portChoice = 'Yes';
    req.body.arrivalPort = 'LFPG';
    await controller(req, res);
    expect(patch).not.to.have.been.called;
    expectErrors(['Either the Arrival or Departure port must be a UK port']);
  });

  it('saves coordinates and outbound direction, then continues to craft using the verified GAR ID', async () => {
    req.session.gar.id = 'stale-session-id';
    await controller(req, res);
    expect(patch).to.have.been.calledOnceWithExactly('ABCDEFGH', 'Draft', {
      arrivalDate: '2022-5-30',
      arrivalTime: '15:00',
      arrivalPort: '45.100000 12.100000',
      arrivalLat: '45.100000',
      arrivalLong: '12.100000',
      arrivalPortChoice: 'No',
      arrivalPortDesc: undefined,
      isInbound: false,
    });
    expect(res.render).not.to.have.been.called;
    expect(res.redirect).to.have.been.calledOnceWithExactly('/garfile/craft');
  });

  it('clears coordinates and saves inbound direction, then returns to the GAR view', async () => {
    res.locals.gar.departurePort = 'LFAT';
    req.body.portChoice = 'Yes';
    req.body.arrivalPort = 'BFS';
    req.body.buttonClicked = 'Save';
    await controller(req, res);
    expect(patch).to.have.been.calledOnce;
    expect(patch.firstCall.args[2]).to.include({
      arrivalPort: 'BFS',
      arrivalLat: '',
      arrivalLong: '',
      arrivalPortChoice: 'Yes',
      isInbound: true,
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
