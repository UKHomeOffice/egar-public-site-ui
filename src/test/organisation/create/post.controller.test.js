const sinon = require('sinon');
const { expect } = require('chai');
const chai = require('chai');
const sinonChai = require('sinon-chai');

require('../../global.test');
const CookieModel = require('../../../common/models/Cookie.class');
const validator = require('../../../common/utils/validator');
const ValidationRule = require('../../../common/models/ValidationRule.class');
const { organisationApi: orgApi } = require('../../../common/services/dataAccessApi');

const controller = require('../../../app/organisation/create/post.controller');

describe('Organisation Create Post Controller', () => {
  let req;
  let res;
  let orgApiStub;

  beforeEach(() => {
    chai.use(sinonChai);

    req = {
      body: {
        orgName: 'New Evil Empire',
      },
      session: {
        u: { dbId: 'USER-DB-ID-1' },
        org: {},
      },
    };
    res = {
      render: sinon.stub(),
    };

    orgApiStub = sinon.stub(orgApi, 'create');
  });

  afterEach(() => {
    sinon.restore();
  });

  ['http_error', 'network_error', 'timeout_error'].forEach((type) => {
    it(`renders a ${type} without assigning an organisation or role`, async () => {
      const failure = Object.assign(new Error('Request failed'), {
        type,
        status: 400,
        body: { message: 'Organisation name already exists' },
      });
      orgApiStub.rejects(failure);

      await controller(req, res);

      expect(req.session.org.i).to.be.undefined;
      expect(req.session.u.rl).to.be.undefined;
      expect(res.render).to.have.been.calledOnceWithExactly('app/organisation/create/index', {
        cookie: new CookieModel(req),
        errors: [type === 'http_error' ? { message: failure.body.message } : failure],
      });
    });
  });

  it('renders validation errors without creating an organisation when the name is empty', async () => {
    req.body.orgName = '';
    const cookie = new CookieModel(req);

    await controller(req, res);

    expect(req.session.org.name).to.eq('');
    expect(req.session.org.i).to.be.undefined;
    expect(req.session.u.rl).to.be.undefined;
    expect(orgApiStub).to.not.have.been.called;
    expect(res.render).to.have.been.calledOnceWithExactly('app/organisation/create/index', {
      cookie,
      errors: [new ValidationRule(validator.notEmpty, 'orgName', '', 'Enter the name of the organisation')],
    });
  });

  it('renders a returned backend message without assigning an organisation or role', async () => {
    const cookie = new CookieModel(req);

    orgApiStub.resolves({
      message: 'User ID not found',
    });

    await controller(req, res);
    expect(req.session.org.name).to.eq('New Evil Empire');
    expect(req.session.org.i).to.be.undefined;
    expect(req.session.u.rl).to.be.undefined;
    expect(orgApiStub).to.have.been.calledOnceWithExactly('New Evil Empire', 'USER-DB-ID-1');
    expect(res.render).to.have.been.calledOnceWithExactly('app/organisation/create/index', {
      cookie,
      errors: [{ message: 'User ID not found' }],
    });
  });

  it('stores the returned organisation and role before rendering success', async () => {
    const cookie = new CookieModel(req);

    orgApiStub.resolves({
      organisation: {
        organisationName: 'New Evil Empire From API',
        organisationId: 'NEW-ORG-ID-123',
      },
      role: { name: 'Admin' },
    });

    await controller(req, res);
    expect(req.session.org.name).to.eq('New Evil Empire From API');
    expect(req.session.org.i).to.eq('NEW-ORG-ID-123');
    expect(req.session.u.rl).to.eq('Admin');
    expect(orgApiStub).to.have.been.calledOnceWithExactly('New Evil Empire', 'USER-DB-ID-1');
    expect(res.render).to.have.been.calledOnceWithExactly('app/organisation/createsuccess/index', {
      cookie,
    });
  });
});
