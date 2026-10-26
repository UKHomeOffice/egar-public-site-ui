const sinon = require('sinon');
const chai = require('chai');

chai.use(require('sinon-chai'));
const { expect } = chai;

require('../../global.test');
const CookieModel = require('../../../common/models/Cookie.class');
const dataAccessApi = require('../../../common/services/dataAccessApi');
const fixedBasedOperatorOptions = require('../../../common/seeddata/fixed_based_operator_options.json');
const utils = require('../../../common/utils/utils');
const controller = require('../../../app/garfile/resperson/get.controller');

describe('GAR Responsible Person Get Controller', () => {
  let req;
  let res;
  let cookie;
  let garStub;
  let listStub;
  let detailsStub;
  let responsiblePerson;
  let responsiblePersons;

  beforeEach(() => {
    req = { session: { u: { dbId: 'user-1' }, gar: { id: 'session-gar' } }, query: {} };
    res = { render: sinon.spy(), locals: { gar: { garId: 'verified-gar' } } };
    cookie = new CookieModel(req);
    responsiblePerson = utils.getResponsiblePersonFromGar({
      responsibleGivenName: 'Benjamin',
      responsibleSurname: 'Sisko',
      responsibleCountry: 'GBR',
    });
    responsiblePersons = [{ responsiblePersonId: 'person-1', responsibleGivenName: 'Sally' }];
    garStub = sinon.stub(dataAccessApi.garApi, 'get').resolves(responsiblePerson);
    listStub = sinon.stub(dataAccessApi.resPersonApi, 'getResPersons').resolves(responsiblePersons);
    detailsStub = sinon.stub(dataAccessApi.resPersonApi, 'getResPersonDetails');
  });

  afterEach(() => sinon.restore());

  it('renders the GAR responsible person and saved-person array', async () => {
    await controller(req, res);

    expect(garStub).to.have.been.calledOnceWithExactly('verified-gar');
    expect(listStub).to.have.been.calledOnceWithExactly('user-1');
    expect(detailsStub).not.to.have.been.called;
    expect(res.render).to.have.been.calledOnceWithExactly('app/garfile/resperson/index', {
      cookie,
      responsiblePerson,
      responsiblePersons,
      fixedBasedOperatorOptions,
    });
  });

  it('renders a selected saved-person object instead of the current GAR person', async () => {
    req.query.resPersonId = 'person-1';
    const selectedPerson = { responsiblePersonId: 'person-1', responsibleGivenName: 'Sally' };
    detailsStub.resolves(selectedPerson);

    await controller(req, res);

    expect(detailsStub).to.have.been.calledOnceWithExactly('user-1', 'person-1');
    expect(res.render).to.have.been.calledOnceWithExactly('app/garfile/resperson/index', {
      cookie,
      responsiblePerson: selectedPerson,
      responsiblePersons,
      fixedBasedOperatorOptions,
    });
  });

  it('renders with no saved persons when the list is empty', async () => {
    listStub.resolves([]);

    await controller(req, res);

    expect(res.render).to.have.been.calledOnceWithExactly('app/garfile/resperson/index', {
      cookie,
      responsiblePerson,
      responsiblePersons: [],
      fixedBasedOperatorOptions,
    });
  });

  it('renders the existing retrieval error when the GAR request fails', async () => {
    garStub.rejects(new Error('Unavailable'));

    await controller(req, res);

    expect(listStub).not.to.have.been.called;
    expect(res.render).to.have.been.calledOnceWithExactly('app/garfile/resperson/index', {
      cookie,
      fixedBasedOperatorOptions,
      errors: [{ message: 'Problem retrieving GAR' }],
    });
  });

  ['list', 'details'].forEach((operation) => {
    ['http_error', 'network_error', 'timeout_error'].forEach((type) => {
      it(`renders the existing retrieval error on a ${operation} ${type}`, async () => {
        const stub = operation === 'list' ? listStub : detailsStub;
        req.query.resPersonId = 'person-1';
        stub.rejects(Object.assign(new Error('Request failed'), { type, status: 404, body: { message: 'Not found' } }));

        await controller(req, res);

        expect(res.render).to.have.been.calledOnceWithExactly('app/garfile/resperson/index', {
          cookie,
          fixedBasedOperatorOptions,
          errors: [{ message: 'Problem retrieving GAR' }],
        });
      });
    });
  });
});
