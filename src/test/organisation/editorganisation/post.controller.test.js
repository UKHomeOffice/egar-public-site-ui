/* eslint-disable no-undef */

const sinon = require('sinon');
const { expect } = require('chai');
const chai = require('chai');
const sinonChai = require('sinon-chai');

require('../../global.test');
const CookieModel = require('../../../common/models/Cookie.class');
const validator = require('../../../common/utils/validator');
const ValidationRule = require('../../../common/models/ValidationRule.class');
const dataAccessApi = require('../../../common/services/dataAccessApi');

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

    orgApiStub = sinon.stub(dataAccessApi.organisationApi, 'update');
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

  it('should render message when name empty', () => {
    req.body.orgName = '';
    cookie = new CookieModel(req);

    const callController = async () => {
      await controller(req, res);
    };

    return callController().then(() => {
      expect(orgApiStub).to.not.have.been.called;
      expect(res.render).to.have.been.calledOnceWithExactly('app/organisation/editorganisation/index', {
        cookie,
        orgName: '',
        errors: [new ValidationRule(validator.notEmpty, 'orgName', '', 'Enter the name of the organisation')],
      });
    });
  });

  it('should render with error message when api rejects', () => {
    cookie = new CookieModel(req);

    orgApiStub.rejects({ message: 'orgApi.update Example Reject' });

    const callController = async () => {
      await controller(req, res);
    };

    return callController()
      .then()
      .then(() => {
        expect(orgApiStub).to.have.been.calledOnceWithExactly('Evil Empire', 'FIRST-ORDER-ID');
        expect(res.render).to.have.been.calledOnceWithExactly('app/organisation/editorganisation/index', {
          cookie,
          orgName: 'Evil Empire',
          errors: [{ message: 'orgApi.update Example Reject' }],
        });
      });
  });

  it('renders an injected Fetch HTTP failure from the organisation update API', async () => {
    orgApiStub.restore();
    const updateStub = sinon.stub(dataAccessApi.organisationApi, 'update').rejects(
      Object.assign(new Error('Organisation update failed'), {
        type: 'http_error',
        status: 409,
        body: { message: 'Organisation name already exists' },
      })
    );

    let finishRender;
    const renderCompleted = new Promise((resolve) => {
      finishRender = resolve;
    });
    res.render = sinon.spy((...args) => finishRender(args));
    controller(req, res);

    const [template, renderData] = await renderCompleted;
    expect(updateStub).to.have.been.calledOnceWithExactly('Evil Empire', 'FIRST-ORDER-ID');
    expect(res.render).to.have.been.calledOnce;
    expect(template).to.equal('app/organisation/editorganisation/index');
    expect(renderData.cookie).to.be.instanceof(CookieModel);
    expect(renderData.orgName).to.equal('Evil Empire');
    expect(renderData.errors).to.deep.equal([{ message: 'Organisation name already exists' }]);
    expect(res.redirect).to.not.have.been.called;
  });

  // TODO: Should there be one for the api error message...?

  it('should redirect and sets cookie value when api ok', () => {
    cookie = new CookieModel(req);

    sinon.stub(req.session, 'save').callsArg(0);
    orgApiStub.resolves({});

    const callController = async () => {
      await controller(req, res);
    };

    return callController()
      .then()
      .then(() => {
        expect(req.session.org.name).to.eq('Evil Empire');
        expect(orgApiStub).to.have.been.calledOnceWithExactly('Evil Empire', 'FIRST-ORDER-ID');
        expect(res.render).to.not.have.been.called;
        expect(req.session.save).to.have.been.called;
        expect(res.redirect).to.have.been.calledOnceWithExactly('/organisation');
      });
  });
});
