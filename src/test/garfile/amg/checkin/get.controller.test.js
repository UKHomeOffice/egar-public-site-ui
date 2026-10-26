const sinon = require('sinon');
const chai = require('chai');
chai.use(require('sinon-chai'));
const { expect } = chai;

require('../../../global.test');
const { garApi } = require('../../../../common/services/dataAccessApi');
const CookieModel = require('../../../../common/models/Cookie.class');
const manifestFields = require('../../../../common/seeddata/gar_manifest_fields.json');
const controller = require('../../../../app/garfile/amg/checkin/get.controller');

describe('AMG Check-in Get Controller', () => {
  let req;
  let res;
  let progress;
  let get;
  let getPeople;
  let getDocs;
  let gar;
  let people;
  let documents;

  beforeEach(() => {
    sinon.useFakeTimers({ now: new Date(2023, 3, 11), toFake: ['Date'] });
    req = { query: {}, session: { gar: { id: 'session-gar' } } };
    res = {
      render: sinon.spy(),
      json: sinon.spy(),
      locals: { gar: { garId: 'GAR-1' } },
    };
    gar = { garId: 'GAR-1', departureDate: '2023-04-11', departureTime: '03:00:00' };
    people = {
      items: [{ garPeopleId: 'PERSON-1', amgCheckinStatus: { name: 'Complete' } }],
      _meta: { totalPages: 2 },
    };
    documents = { items: [] };
    progress = sinon.stub(garApi, 'getGarCheckinProgress').resolves('Complete');
    get = sinon.stub(garApi, 'get').resolves(gar);
    getDocs = sinon.stub(garApi, 'getSupportingDocs').resolves(documents);
    getPeople = sinon.stub(garApi, 'getPeople');
    getPeople.withArgs('GAR-1', 1).resolves(people);
    getPeople.withArgs('GAR-1', '', '0T').resolves({ items: [{ garPeopleId: 'PERSON-1' }] });
    getPeople.withArgs('GAR-1', '', '0B').resolves({ items: [] });
  });

  afterEach(() => sinon.restore());

  function expectError() {
    expect(res.json).not.to.have.been.called;
    expect(res.render).to.have.been.calledOnceWithExactly('app/garfile/amg/checkin/index', {
      cookie: new CookieModel(req),
      errors: [{ message: 'There was an error retrieving the GAR. Try again later' }],
    });
  }

  it('returns the unwrapped progress value when polling without loading the page', async () => {
    req.query.poll = '';
    progress.resolves('Incomplete');
    await controller(req, res);
    expect(progress).to.have.been.calledOnceWithExactly('GAR-1');
    expect(res.json).to.have.been.calledOnceWithExactly('Incomplete');
    expect(get).not.to.have.been.called;
    expect(getPeople).not.to.have.been.called;
    expect(getDocs).not.to.have.been.called;
    expect(res.render).not.to.have.been.called;
  });

  it('does not return an HTTP progress-error envelope as successful polling data', async () => {
    req.query.poll = '';
    progress.resolves({ statusCode: 503, body: { message: 'Unavailable' } });
    await controller(req, res);
    expect(get).not.to.have.been.called;
    expectError();
  });

  it('renders a retrieval error when progress rejects', async () => {
    progress.rejects(new Error('Connection unavailable'));
    await controller(req, res);
    expect(get).not.to.have.been.called;
    expectError();
  });

  it('renders decoded check-in data, counts, pagination and the important banner', async () => {
    await controller(req, res);
    expect(get).to.have.been.calledOnceWithExactly('GAR-1');
    expect(getDocs).to.have.been.calledOnceWithExactly('GAR-1');
    expect(getPeople).to.have.been.calledThrice;
    expect(getPeople).to.have.been.calledWithExactly('GAR-1', 1);
    expect(getPeople).to.have.been.calledWithExactly('GAR-1', '', '0T');
    expect(getPeople).to.have.been.calledWithExactly('GAR-1', '', '0B');
    expect(res.render).to.have.been.calledOnceWithExactly('app/garfile/amg/checkin/index', {
      cookie: new CookieModel(req),
      manifestFields,
      garfile: gar,
      garpeople: people,
      garsupportingdocs: documents,
      showChangeLinks: true,
      statusCheckComplete: true,
      numberOf0TResponseCodes: 1,
      resubmitted: 'no',
      durationInDeparture: 180,
      pages: people._meta,
      currentPage: 1,
      showImportantBanner: true,
      numberOf0BResponseCodes: 0,
      initialSubmit: '',
    });
  });

  it('renders the requested pane and page with pending and no-board passengers', async () => {
    req.query = { template: 'pane', page: '2', initialSubmit: 'yes' };
    people.items[0].amgCheckinStatus.name = 'Pending';
    getPeople.withArgs('GAR-1', '2').resolves(people);
    getPeople.withArgs('GAR-1', '', '0B').resolves({ items: [{ garPeopleId: 'PERSON-2' }] });
    await controller(req, res);
    expect(res.render).to.have.been.calledOnce;
    const [template, context] = res.render.firstCall.args;
    expect(template).to.equal('app/garfile/amg/checkin/pane');
    expect(context).to.include({
      currentPage: '2',
      initialSubmit: '&initialSubmit=yes',
      statusCheckComplete: false,
      numberOf0BResponseCodes: 1,
    });
  });

  it('renders the resubmit page without the important banner while resubmission is incomplete', async () => {
    req.query.resubmitted = 'yes';
    progress.resolves('Incomplete');
    await controller(req, res);
    expect(res.render).to.have.been.calledOnce;
    expect(res.render.firstCall.args[0]).to.equal('app/garfile/amg/checkin/resubmit');
    expect(res.render.firstCall.args[1]).to.include({ resubmitted: 'yes', showImportantBanner: false });
  });

  it('hides the important banner within 125 minutes of departure', async () => {
    gar.departureTime = '02:05:00';
    await controller(req, res);
    expect(res.render).to.have.been.calledOnce;
    expect(res.render.firstCall.args[1]).to.include({ durationInDeparture: 125, showImportantBanner: false });
  });

  it('renders an error rather than a partial page when a GAR read returns an HTTP envelope', async () => {
    getDocs.resolves({ statusCode: 503, body: { message: 'Unavailable' } });
    await controller(req, res);
    expectError();
  });

  it('catches a failed filtered-person lookup before rendering the page', async () => {
    getPeople.withArgs('GAR-1', '', '0T').rejects(new Error('People unavailable'));
    await controller(req, res);
    expectError();
  });
});
