const sinon = require('sinon');
const chai = require('chai');
chai.use(require('sinon-chai'));
const { expect } = chai;

require('../../global.test');
const { garApi } = require('../../../common/services/dataAccessApi');
const CookieModel = require('../../../common/models/Cookie.class');
const { garPeople } = require('../../fixtures');
const controller = require('../../../app/garfile/review/post.controller');

describe('GAR Review Post Controller', () => {
  let req;
  let res;
  let gar;
  let people;
  let get;
  let getPeople;
  let getDocs;
  let checkin;
  let submit;

  beforeEach(() => {
    sinon.useFakeTimers({ now: new Date('2023-04-11T00:00:00Z'), toFake: ['Date'] });
    req = {
      body: {},
      session: {
        gar: { id: 'stale-session-id', status: 'Draft' },
        submiterrormessage: [],
        save: sinon.stub().callsArg(0),
      },
    };
    res = {
      redirect: sinon.spy(),
      render: sinon.spy(),
      locals: { gar: { garId: 'ABCDE' } },
    };
    gar = {
      garId: 'ABCDE',
      registration: 'Z-AFTC',
      departureDate: '2023-04-11',
      departureTime: '03:00:00',
      arrivalDate: '2023-04-11',
      arrivalTime: '04:00:00',
      departurePort: 'EGLL',
      arrivalPort: 'LFAT',
      status: { name: 'Draft' },
      responsibleGivenName: 'James',
      prohibitedGoods: 'No',
      freeCirculation: 'No',
      visitReason: 'No',
      intentionValue: 'No',
      isInbound: false,
    };
    people = { items: garPeople() };
    get = sinon.stub(garApi, 'get').resolves(gar);
    getPeople = sinon.stub(garApi, 'getPeople').resolves(people);
    getDocs = sinon.stub(garApi, 'getSupportingDocs').resolves({ items: [] });
    checkin = sinon.stub(garApi, 'submitGARForCheckin').resolves({});
    submit = sinon.stub(garApi, 'patch').resolves({ garId: 'ABCDE' });
  });

  afterEach(() => sinon.restore());

  function expectNoSubmission() {
    expect(checkin).not.to.have.been.called;
    expect(submit).not.to.have.been.called;
    expect(req.session.gar.status).to.equal('Draft');
  }

  function expectRetrievalError() {
    expectNoSubmission();
    expect(res.redirect).not.to.have.been.called;
    expect(res.render).to.have.been.calledOnceWithExactly('app/garfile/review/index', {
      cookie: new CookieModel(req),
      errors: [{ message: 'There was an error retrieving the GAR. Try again later' }],
    });
  }

  it('stops if retrieving the GAR data rejects', async () => {
    getDocs.rejects(new Error('Documents unavailable'));
    await controller(req, res);
    expect(get).to.have.been.calledOnceWithExactly('ABCDE');
    expect(getPeople).to.have.been.calledOnceWithExactly('ABCDE');
    expect(getDocs).to.have.been.calledOnceWithExactly('ABCDE');
    expectRetrievalError();
  });

  it('stops on an HTTP read envelope instead of submitting without supporting documents', async () => {
    getDocs.resolves({ statusCode: 503, body: { message: 'Unavailable' } });
    await controller(req, res);
    expectRetrievalError();
  });

  it('saves the already-submitted error rather than submitting twice', async () => {
    gar.status.name = 'Submitted';
    await controller(req, res);
    expectNoSubmission();
    expect(req.session.submiterrormessage).to.deep.equal([
      { message: 'This GAR has already been submitted', identifier: '' },
    ]);
    expect(req.session.save).to.have.been.calledOnce;
    expect(res.redirect).to.have.been.calledOnceWithExactly('/garfile/review');
  });

  it('renders review validation errors without starting check-in or submission', async () => {
    delete gar.registration;
    await controller(req, res);
    expectNoSubmission();
    expect(res.redirect).not.to.have.been.called;
    expect(res.render).to.have.been.calledOnce;
    const [template, context] = res.render.firstCall.args;
    expect(template).to.equal('app/garfile/review/index');
    expect(context.garfile).to.equal(gar);
    expect(context.garpeople).to.equal(people);
    expect(context.errors).to.have.length(1);
    expect(context.errors[0]).to.include({
      identifier: 'aircraft',
      message: 'Aircraft registration must be completed',
    });
  });

  it('requires manifest errors to be resolved before submission', async () => {
    people.items[0].documentNumber = '';
    await controller(req, res);
    expectNoSubmission();
    expect(res.render).to.have.been.calledOnce;
    expect(res.render.firstCall.args[1].errors.map((error) => error.message)).to.include(
      'Resolve manifest errors before submitting'
    );
  });

  it('requires captain or crew for a non-military flight', async () => {
    people.items = [];
    await controller(req, res);
    expectNoSubmission();
    expect(res.render).to.have.been.calledOnce;
    expect(res.render.firstCall.args[1].errors.map((error) => error.identifier)).to.include('manifest');
  });

  it('checks people in before submitting an outbound GAR and rendering success', async () => {
    await controller(req, res);
    expect(checkin).to.have.been.calledOnceWithExactly('ABCDE');
    expect(submit).to.have.been.calledOnceWithExactly('ABCDE', 'Submitted', {});
    expect(checkin).to.have.been.calledBefore(submit);
    expect(req.session.gar.status).to.equal('Submitted');
    expect(req.session.gar.isInbound).to.equal(false);
    expect(res.redirect).not.to.have.been.called;
    expect(res.render).to.have.been.calledOnceWithExactly('app/garfile/submit/success/index', {
      cookie: new CookieModel(req),
    });
  });

  it('sends inbound passengers to check-in rather than submitting immediately', async () => {
    gar.departurePort = 'LFAT';
    gar.arrivalPort = 'EGLL';
    req.body.initialSubmit = 'yes';
    await controller(req, res);
    expect(checkin).to.have.been.calledOnceWithExactly('ABCDE');
    expect(submit).not.to.have.been.called;
    expect(res.render).not.to.have.been.called;
    expect(res.redirect).to.have.been.calledOnceWithExactly('/garfile/amg/checkin?resubmitted=no&initialSubmit=yes');
  });

  it('submits an inbound GAR after status checking is complete', async () => {
    gar.departurePort = 'LFAT';
    gar.arrivalPort = 'EGLL';
    gar.isInbound = true;
    req.body.statuscheck = 'StatusCheckComplete';
    await controller(req, res);
    expect(submit).to.have.been.calledOnceWithExactly('ABCDE', 'Submitted', {});
    expect(req.session.gar.isInbound).to.equal(true);
    expect(res.render.firstCall.args[0]).to.equal('app/garfile/submit/success/index');
  });

  it('submits an inbound all-military flight without a passenger-check page', async () => {
    gar.departurePort = 'LFAT';
    gar.arrivalPort = 'EGLL';
    gar.isMilitaryFlight = true;
    people.items = [];
    await controller(req, res);
    expect(submit).to.have.been.calledOnceWithExactly('ABCDE', 'Submitted', {});
    expect(res.redirect).not.to.have.been.called;
    expect(res.render.firstCall.args[0]).to.equal('app/garfile/submit/success/index');
  });

  it('does not submit or mark a 0T resubmission complete when check-in rejects', async () => {
    req.body.resubmitFor0T = 'resubmit0TOnSummaryPage';
    req.session.resubmitFor0T = ['OTHER-GAR'];
    checkin.rejects(
      Object.assign(new Error('Bad Request'), {
        type: 'http_error',
        status: 400,
        body: { message: 'Check-in unavailable' },
      })
    );
    await controller(req, res);
    expect(submit).not.to.have.been.called;
    expect(req.session.resubmitFor0T).to.deep.equal(['OTHER-GAR']);
    expect(res.redirect).not.to.have.been.called;
    expect(res.render).to.have.been.calledOnceWithExactly('app/garfile/review/index.njk', {
      cookie: new CookieModel(req),
    });
  });

  it('resubmits a submitted 0T GAR for check-in and records it without submitting the GAR again', async () => {
    gar.status.name = 'Submitted';
    req.body.resubmitFor0T = 'resubmit0TOnSummaryPage';
    req.body.resubmitFor0TLink = 'yes';
    req.session.resubmitFor0T = ['OTHER-GAR'];
    await controller(req, res);
    expect(checkin).to.have.been.calledOnceWithExactly('ABCDE');
    expect(submit).not.to.have.been.called;
    expect(req.session.resubmitFor0T).to.deep.equal(['OTHER-GAR', 'ABCDE']);
    expect(req.session.submiterrormessage).to.deep.equal([]);
    expect(res.redirect).to.have.been.calledOnceWithExactly('/garfile/view?resubmitted=yes');
  });

  it('does not duplicate a GAR already recorded as resubmitted', async () => {
    req.body.resubmitFor0T = 'resubmit0TOnSummaryPage';
    req.session.resubmitFor0T = ['ABCDE'];
    await controller(req, res);
    expect(req.session.resubmitFor0T).to.deep.equal(['ABCDE']);
    expect(submit).not.to.have.been.called;
    expect(res.redirect).to.have.been.calledOnceWithExactly('/garfile/view?resubmitted=no');
  });

  it('saves the existing review error journey when submission rejects with an HTTP message', async () => {
    submit.rejects(
      Object.assign(new Error('Bad Request'), {
        type: 'http_error',
        status: 400,
        body: { message: 'Submission rejected' },
      })
    );
    await controller(req, res);
    expect(req.session.gar.status).to.equal('Draft');
    expect(req.session.submiterrormessage).to.deep.equal([
      { message: 'An error has occurred. Try again later', identifier: '' },
    ]);
    expect(req.session.save).to.have.been.calledOnce;
    expect(req.session.save).to.have.been.calledBefore(res.redirect);
    expect(res.render).not.to.have.been.called;
    expect(res.redirect).to.have.been.calledOnceWithExactly('/garfile/review');
  });

  it('renders the submission failure page when submission has a transport failure', async () => {
    submit.rejects(new Error('Connection unavailable'));
    await controller(req, res);
    expect(req.session.gar.status).to.equal('Draft');
    expect(res.redirect).not.to.have.been.called;
    expect(res.render).to.have.been.calledOnceWithExactly('app/garfile/submit/failure/index', {
      cookie: new CookieModel(req),
    });
  });

  it('preserves the review error journey for a decoded submission message', async () => {
    submit.resolves({ message: 'Submission rejected' });
    await controller(req, res);
    expect(req.session.gar.status).to.equal('Draft');
    expect(req.session.submiterrormessage).to.deep.equal([
      { message: 'An error has occurred. Try again later', identifier: '' },
    ]);
    expect(res.render).not.to.have.been.called;
    expect(res.redirect).to.have.been.calledOnceWithExactly('/garfile/review');
  });
});
