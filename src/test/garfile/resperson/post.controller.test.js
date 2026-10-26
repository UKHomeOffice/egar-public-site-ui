const sinon = require('sinon');
const chai = require('chai');

chai.use(require('sinon-chai'));
const { expect } = chai;

require('../../global.test');
const CookieModel = require('../../../common/models/Cookie.class');
const garApi = require('../../../common/services/data-access/garApi');
const dataAccessApi = require('../../../common/services/dataAccessApi');
const fixedBasedOperatorOptions = require('../../../common/seeddata/fixed_based_operator_options.json');
const utils = require('../../../common/utils/utils');
const controller = require('../../../app/garfile/resperson/post.controller');

describe('GAR Responsible Person Post Controller', () => {
  let req;
  let res;
  let cookie;
  let listStub;
  let patchStub;
  let responsiblePerson;
  let responsiblePersons;

  beforeEach(() => {
    req = {
      body: {
        responsibleGivenName: 'Benjamin',
        responsibleSurname: 'Sisko',
        responsibleContactNo: '07878787878',
        responsibleEmail: 'test@example.com',
        responsibleAddressLine1: 'Add Line 1',
        responsibleAddressLine2: 'Add Line 2',
        responsibleTown: 'London',
        responsibleCountry: 'USA',
        responsiblePostcode: 'HN77NH',
        fixedBasedOperator: 'Captain',
        buttonClicked: 'Save and continue',
      },
      session: {
        u: { dbId: 'user-1' },
        gar: { id: 'session-gar', status: 'Draft', responsiblePerson: {} },
      },
    };
    res = {
      render: sinon.spy(),
      redirect: sinon.spy(),
      locals: { gar: { garId: 'verified-gar' } },
    };
    cookie = new CookieModel(req);
    responsiblePerson = utils.getResponsiblePersonFromReq(req);
    responsiblePersons = [{ responsiblePersonId: 'person-1', responsibleGivenName: 'Sally' }];
    listStub = sinon.stub(dataAccessApi.resPersonApi, 'getResPersons').resolves(responsiblePersons);
    patchStub = sinon.stub(garApi, 'patch').resolves(JSON.stringify({}));
  });

  afterEach(() => sinon.restore());

  it('redirects to the selected saved person without fetching or updating anything', async () => {
    req.body.addResponsiblePerson = 'person-1';
    req.body.buttonClicked = 'Add to GAR';

    await controller(req, res);

    expect(listStub).not.to.have.been.called;
    expect(patchStub).not.to.have.been.called;
    expect(res.redirect).to.have.been.calledOnceWithExactly('/garfile/resperson?resPersonId=person-1');
    expect(res.render).not.to.have.been.called;
  });

  it('retains the existing GAR patch and advances to customs on success', async () => {
    await controller(req, res);

    expect(listStub).to.have.been.calledOnceWithExactly('user-1');
    expect(patchStub).to.have.been.calledOnceWithExactly('verified-gar', 'Draft', responsiblePerson);
    expect(cookie.getGarResponsiblePerson()).to.deep.equal(responsiblePerson);
    expect(res.redirect).to.have.been.calledOnceWithExactly('/garfile/customs');
    expect(res.render).not.to.have.been.called;
  });

  it('redirects to the GAR view for the other save action', async () => {
    req.body.buttonClicked = 'Save';

    await controller(req, res);

    expect(res.redirect).to.have.been.calledOnceWithExactly(307, '/garfile/view');
  });

  it('retains submitted values and the saved-person array on local validation failure', async () => {
    req.body.responsibleSurname = '';
    responsiblePerson.responsibleSurname = '';

    await controller(req, res);

    expect(patchStub).not.to.have.been.called;
    expect(res.redirect).not.to.have.been.called;
    expect(cookie.getGarResponsiblePerson()).to.deep.equal(responsiblePerson);
    expect(res.render).to.have.been.calledOnce;
    const [template, context] = res.render.firstCall.args;
    expect(template).to.equal('app/garfile/resperson/index');
    expect(context.responsiblePerson).to.deep.equal(responsiblePerson);
    expect(context.responsiblePersons).to.equal(responsiblePersons);
    expect(context.errors).to.have.length(1);
    expect(context.errors[0]).to.include({
      identifier: 'responsibleSurname',
      message: 'Enter a surname for the responsible person',
    });
  });

  it('preserves backend messages from the unchanged GAR patch wrapper', async () => {
    patchStub.resolves(JSON.stringify({ message: 'Invalid responsible person' }));

    await controller(req, res);

    expect(res.render).to.have.been.calledOnceWithExactly('app/garfile/resperson/index', {
      cookie,
      fixedBasedOperatorOptions,
      errors: [{ message: 'Invalid responsible person' }],
    });
    expect(res.redirect).not.to.have.been.called;
  });

  it('retains the saved-person array and submitted values when the GAR patch rejects', async () => {
    patchStub.rejects(new Error('Unavailable'));

    await controller(req, res);

    expect(res.render).to.have.been.calledOnceWithExactly('app/garfile/resperson/index', {
      cookie,
      responsiblePerson,
      responsiblePersons,
      fixedBasedOperatorOptions,
      errors: [{ message: 'Failed to add to GAR' }],
    });
    expect(res.redirect).not.to.have.been.called;
  });

  ['http_error', 'network_error', 'timeout_error'].forEach((type) => {
    it(`renders a saved-person lookup error without updating the GAR on a ${type}`, async () => {
      listStub.rejects(
        Object.assign(new Error('Request failed'), { type, status: 503, body: { message: 'Unavailable' } })
      );

      await controller(req, res);

      expect(listStub).to.have.been.calledOnceWithExactly('user-1');
      expect(patchStub).not.to.have.been.called;
      expect(cookie.getGarResponsiblePerson()).to.deep.equal({});
      expect(res.render).to.have.been.calledOnceWithExactly('app/garfile/resperson/index', {
        cookie,
        responsiblePerson,
        fixedBasedOperatorOptions,
        errors: [{ message: 'Failed to get saved responsible persons' }],
      });
      expect(res.redirect).not.to.have.been.called;
    });
  });
});
