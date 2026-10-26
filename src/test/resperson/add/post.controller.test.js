const sinon = require('sinon');
const chai = require('chai');

chai.use(require('sinon-chai'));
const { expect } = chai;

require('../../global.test');
const CookieModel = require('../../../common/models/Cookie.class');
const fixedBasedOperatorOptions = require('../../../common/seeddata/fixed_based_operator_options.json');
const dataAccessApi = require('../../../common/services/dataAccessApi');
const utils = require('../../../common/utils/utils');
const controller = require('../../../app/resperson/add/post.controller');

describe('Responsible Person Add Post Controller', () => {
  let req;
  let res;
  let cookie;
  let createStub;
  let responsiblePerson;

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
      },
      session: { u: { dbId: 'user-1' } },
    };
    res = { redirect: sinon.spy(), render: sinon.spy() };
    cookie = new CookieModel(req);
    responsiblePerson = utils.getResponsiblePersonFromReq(req);
    createStub = sinon.stub(dataAccessApi.resPersonApi, 'create').resolves({});
  });

  afterEach(() => sinon.restore());

  it('renders local validation errors and retains form values without calling the API', async () => {
    req.body.responsibleSurname = '';

    await controller(req, res);

    expect(createStub).not.to.have.been.called;
    expect(res.redirect).not.to.have.been.called;
    expect(res.render).to.have.been.calledOnce;
    const [template, context] = res.render.firstCall.args;
    expect(template).to.equal('app/resperson/add/index');
    expect(context).to.include({ req, fixedBasedOperatorOptions });
    expect(context.responsiblePerson).to.deep.equal({ ...responsiblePerson, responsibleSurname: '' });
    expect(context.errors).to.have.length(1);
    expect(context.errors[0]).to.include({
      identifier: 'responsibleSurname',
      message: 'Enter a surname for the responsible person',
    });
  });

  it('creates the responsible person and redirects', async () => {
    await controller(req, res);

    expect(createStub).to.have.been.calledOnceWithExactly('user-1', responsiblePerson);
    expect(res.redirect).to.have.been.calledOnceWithExactly('/resperson');
    expect(res.render).not.to.have.been.called;
  });

  it('trims the custom role before saving', async () => {
    req.body.fixedBasedOperator = 'Other';
    req.body.fixedBasedOperatorAnswer = '  Pilot  ';

    await controller(req, res);

    expect(createStub.firstCall.args[1]).to.include({
      fixedBasedOperator: 'Other',
      fixedBasedOperatorAnswer: 'Pilot',
    });
    expect(res.redirect).to.have.been.calledOnceWithExactly('/resperson');
  });

  ['response', 'http_error'].forEach((type) => {
    it(`preserves backend validation messages and form values from a ${type}`, async () => {
      const body = { message: 'Invalid surname', identifier: 'responsibleSurname' };
      if (type === 'response') {
        createStub.resolves(body);
      } else {
        createStub.rejects(Object.assign(new Error('Bad request'), { type, status: 400, body }));
      }

      await controller(req, res);

      expect(res.render).to.have.been.calledOnceWithExactly('app/resperson/add/index', {
        cookie,
        fixedBasedOperatorOptions,
        errors: [body],
        responsiblePerson,
      });
      expect(res.redirect).not.to.have.been.called;
    });
  });

  ['http_error', 'network_error', 'timeout_error'].forEach((type) => {
    it(`renders the existing creation error on a ${type}`, async () => {
      createStub.rejects(Object.assign(new Error('Request failed'), { type, status: 503, body: 'Unavailable' }));

      await controller(req, res);

      expect(createStub).to.have.been.calledOnceWithExactly('user-1', responsiblePerson);
      expect(res.render).to.have.been.calledOnceWithExactly('app/resperson/add/index', {
        cookie,
        fixedBasedOperatorOptions,
        errors: [{ message: 'There was a problem creating the responsible person. Please try again' }],
      });
      expect(res.redirect).not.to.have.been.called;
    });
  });
});
