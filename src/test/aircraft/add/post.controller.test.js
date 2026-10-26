const sinon = require('sinon');
const chai = require('chai');

chai.use(require('sinon-chai'));
const { expect } = chai;

require('../../global.test');
const dataAccessApi = require('../../../common/services/dataAccessApi');
const CookieModel = require('../../../common/models/Cookie.class');
const controller = require('../../../app/aircraft/add/post.controller');
const pagination = require('../../../common/utils/pagination');

describe('Aircraft Add Post Controller', () => {
  let req;
  let res;
  let cookie;
  let createStub;
  let saveStub;
  let pageStub;
  let craftObj;

  beforeEach(() => {
    req = {
      body: { registration: 'G-ABCD', craftType: 'Gulfstream', craftBasePort: 'LHR' },
      session: { u: { dbId: 'user-1' }, save: (callback) => callback() },
    };
    res = { redirect: sinon.spy(), render: sinon.spy() };
    cookie = new CookieModel(req);
    craftObj = { ...req.body, craftBaseLat: null, craftBaseLong: null, portChoice: 'Yes' };
    createStub = sinon.stub(dataAccessApi.craftApi, 'create').resolves({});
    saveStub = sinon.stub(req.session, 'save').callsArg(0);
    pageStub = sinon.stub(pagination, 'setCurrentPage');
  });

  afterEach(() => sinon.restore());

  ['registration', 'craftType', 'craftBasePort'].forEach((field) => {
    it(`renders local validation errors for an empty ${field} without calling the API`, async () => {
      req.body[field] = '';

      await controller(req, res);

      expect(createStub).not.to.have.been.called;
      expect(saveStub).not.to.have.been.called;
      expect(res.render).to.have.been.calledOnce;
      const [template, context] = res.render.firstCall.args;
      expect(template).to.equal('app/aircraft/add/index');
      expect(context.cookie).to.deep.equal(cookie);
      expect(context.craftObj).to.deep.equal({ ...craftObj, [field]: '' });
      expect(context.errors).to.have.length(1);
      expect(context.errors[0]).to.include({ identifier: field });
    });
  });

  it('saves the last-page selection and redirects after creating the aircraft', async () => {
    await controller(req, res);

    expect(createStub).to.have.been.calledOnceWithExactly('G-ABCD', 'Gulfstream', 'LHR', 'user-1');
    expect(pageStub).to.have.been.calledOnceWithExactly(req, '/aircraft', 1000000);
    expect(saveStub).to.have.been.calledOnce;
    expect(res.redirect).to.have.been.calledOnceWithExactly('/aircraft');
    expect(res.render).not.to.have.been.called;
  });

  it('creates an aircraft with coordinates instead of a port', async () => {
    Object.assign(req.body, { portChoice: 'No', craftBaseLat: '51.500000', craftBaseLong: '-0.100000' });

    await controller(req, res);

    expect(createStub).to.have.been.calledOnceWithExactly('G-ABCD', 'Gulfstream', '51.500000 -0.100000', 'user-1');
  });

  it('renders a message returned in a successful HTTP response', async () => {
    createStub.resolves({ message: 'Aircraft not saved' });

    await controller(req, res);

    expect(res.render).to.have.been.calledOnceWithExactly('app/aircraft/add/index', {
      cookie,
      errors: [{ message: 'Aircraft not saved' }],
    });
    expect(saveStub).not.to.have.been.called;
  });

  it('preserves a backend validation error body from an HTTP rejection', async () => {
    const body = { message: 'Registration is invalid', field: 'registration' };
    createStub.rejects(Object.assign(new Error('Bad request'), { type: 'http_error', status: 400, body }));

    await controller(req, res);

    expect(res.render).to.have.been.calledOnceWithExactly('app/aircraft/add/index', { cookie, errors: [body] });
    expect(saveStub).not.to.have.been.called;
  });

  [
    ['unexpected text response', 'resolve', 'Unavailable', 'There was a problem saving the aircraft. Try again later'],
    ['duplicate text response', 'resolve', 'DETAIL:  Key (registration)', 'Craft already exists'],
    ['duplicate HTTP failure', 'http_error', 'DETAIL:  Key (registration)', 'Craft already exists'],
    [
      'server failure',
      'http_error',
      '<html>Unavailable</html>',
      'There was a problem saving the aircraft. Try again later',
    ],
    ['network failure', 'network_error', undefined, 'There was a problem saving the aircraft. Try again later'],
    ['timeout', 'timeout_error', undefined, 'There was a problem saving the aircraft. Try again later'],
  ].forEach(([description, type, body, message]) => {
    it(`renders an error without saving or redirecting on a ${description}`, async () => {
      if (type === 'resolve') {
        createStub.resolves(body);
      } else {
        createStub.rejects(Object.assign(new Error('Request failed'), { type, status: 500, body }));
      }

      await controller(req, res);

      expect(res.render).to.have.been.calledOnceWithExactly('app/aircraft/add/index', {
        cookie,
        craftObj,
        errors: [{ message }],
      });
      expect(pageStub).not.to.have.been.called;
      expect(saveStub).not.to.have.been.called;
      expect(res.redirect).not.to.have.been.called;
    });
  });
});
