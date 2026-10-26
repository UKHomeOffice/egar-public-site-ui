const sinon = require('sinon');
const { expect } = require('chai');
const chai = require('chai');
const sinonChai = require('sinon-chai');

require('../../global.test');
const CookieModel = require('../../../common/models/Cookie.class');
const validator = require('../../../common/utils/validator');
const ValidationRule = require('../../../common/models/ValidationRule.class');
const { organisationApi } = require('../../../common/services/dataAccessApi');

const controller = require('../../../app/organisation/editorganisation/post.controller');

describe('Organisation Edit Post Controller', () => {
  let req;
  let res;
  let orgApiStub;

  beforeEach(() => {
    chai.use(sinonChai);

    req = {
      body: {
        orgName: 'Evil Empire',
      },
      session: {
        org: { i: 'FIRST-ORDER-ID' },
        save: (callback) => callback(),
      },
    };
    res = {
      redirect: sinon.stub(),
      render: sinon.stub(),
    };

    orgApiStub = sinon.stub(organisationApi, 'update');
  });

  afterEach(() => {
    sinon.restore();
  });

  ['http_error', 'network_error', 'timeout_error'].forEach((type) => {
    it(`retains the organisation name and form input on a ${type}`, async () => {
      req.session.org.name = 'Original name';
      const saveStub = sinon.stub(req.session, 'save').callsArg(0);
      const failure = Object.assign(new Error('Request failed'), {
        type,
        status: 409,
        body: { message: 'Organisation name already exists' },
      });
      orgApiStub.rejects(failure);

      await controller(req, res);

      expect(orgApiStub).to.have.been.calledOnceWithExactly('Evil Empire', 'FIRST-ORDER-ID');
      expect(req.session.org.name).to.equal('Original name');
      expect(saveStub).not.to.have.been.called;
      expect(res.redirect).not.to.have.been.called;
      expect(res.render).to.have.been.calledOnceWithExactly('app/organisation/editorganisation/index', {
        cookie: new CookieModel(req),
        orgName: 'Evil Empire',
        errors: [type === 'http_error' ? failure.body : failure],
      });
    });
  });

  it('renders validation errors without calling the API when the name is empty', async () => {
    req.body.orgName = '';
    const cookie = new CookieModel(req);

    await controller(req, res);

    expect(orgApiStub).to.not.have.been.called;
    expect(res.render).to.have.been.calledOnceWithExactly('app/organisation/editorganisation/index', {
      cookie,
      orgName: '',
      errors: [new ValidationRule(validator.notEmpty, 'orgName', '', 'Enter the name of the organisation')],
    });
  });

  it('updates the session name and redirects after a successful update', async () => {
    sinon.stub(req.session, 'save').callsArg(0);
    orgApiStub.resolves({});

    await controller(req, res);
    expect(req.session.org.name).to.eq('Evil Empire');
    expect(orgApiStub).to.have.been.calledOnceWithExactly('Evil Empire', 'FIRST-ORDER-ID');
    expect(res.render).to.not.have.been.called;
    expect(req.session.save).to.have.been.calledOnce;
    expect(res.redirect).to.have.been.calledOnceWithExactly('/organisation');
  });
});
