const sinon = require('sinon');
const chai = require('chai');

chai.use(require('sinon-chai'));
const { expect } = chai;

require('../../global.test');
const CookieModel = require('../../../common/models/Cookie.class');
const dataAccessApi = require('../../../common/services/dataAccessApi');
const controller = require('../../../app/aircraft/edit/post.controller');

describe('Aircraft Edit Post Controller', () => {
  let req;
  let res;
  let cookie;
  let updateStub;

  beforeEach(() => {
    req = {
      body: { registration: 'G-ABCD', craftType: 'Hondajet', craftBasePort: 'LHR' },
      session: { u: { dbId: 'user-1' } },
    };
    cookie = new CookieModel(req);
    cookie.setEditCraft({ craftId: 'craft-1', registration: 'G-OLD', craftType: 'Old', craftBase: 'LHR' });
    res = { redirect: sinon.spy(), render: sinon.spy() };
    updateStub = sinon.stub(dataAccessApi.craftApi, 'update').resolves({});
  });

  afterEach(() => sinon.restore());

  it('renders local validation errors without updating the aircraft', async () => {
    Object.assign(req.body, { registration: '', craftType: '', craftBasePort: '' });

    await controller(req, res);

    expect(updateStub).not.to.have.been.called;
    expect(res.redirect).not.to.have.been.called;
    expect(res.render).to.have.been.calledOnce;
    const [template, context] = res.render.firstCall.args;
    expect(template).to.equal('app/aircraft/edit/index');
    expect(context.cookie).to.deep.equal(cookie);
    expect(context.errors.map(({ identifier }) => identifier)).to.deep.equal([
      'registration',
      'craftType',
      'craftBasePort',
    ]);
  });

  it('updates the aircraft using the configured instance and redirects', async () => {
    await controller(req, res);

    expect(updateStub).to.have.been.calledOnceWithExactly('G-ABCD', 'Hondajet', 'LHR', 'user-1', 'craft-1');
    expect(cookie.getEditCraft()).to.include({ registration: 'G-ABCD', craftType: 'Hondajet' });
    expect(res.redirect).to.have.been.calledOnceWithExactly('/aircraft');
    expect(res.render).not.to.have.been.called;
  });

  it('updates the aircraft with coordinates instead of a port', async () => {
    Object.assign(req.body, { portChoice: 'No', craftBaseLat: '51.500000', craftBaseLong: '-0.100000' });
    delete req.body.craftBasePort;

    await controller(req, res);

    expect(updateStub).to.have.been.calledOnceWithExactly(
      'G-ABCD',
      'Hondajet',
      '51.500000 -0.100000',
      'user-1',
      'craft-1'
    );
  });

  it('renders a message returned in a successful HTTP response', async () => {
    updateStub.resolves({ message: 'Aircraft not found' });

    await controller(req, res);

    expect(res.render).to.have.been.calledOnceWithExactly('app/aircraft/edit/index', {
      cookie,
      errors: [{ message: 'Aircraft not found' }],
    });
    expect(res.redirect).not.to.have.been.called;
  });

  it('preserves a backend validation error body from an HTTP rejection', async () => {
    const body = { message: 'Registration is invalid', field: 'registration' };
    updateStub.rejects(Object.assign(new Error('Bad request'), { type: 'http_error', status: 400, body }));

    await controller(req, res);

    expect(res.render).to.have.been.calledOnceWithExactly('app/aircraft/edit/index', { cookie, errors: [body] });
    expect(res.redirect).not.to.have.been.called;
  });

  [
    [
      'unexpected text response',
      'resolve',
      '<html>Unavailable</html>',
      'There was a problem saving the aircraft. Try again later',
    ],
    ['duplicate text response', 'resolve', 'DETAIL:  Key (registration)', 'Craft already exists'],
    ['duplicate HTTP failure', 'http_error', 'DETAIL:  Key (registration)', 'Craft already exists'],
    [
      'server failure',
      'http_error',
      '<html>Unavailable</html>',
      'There was a problem saving the aircraft. Try again later',
    ],
    ['network failure', 'network_error', undefined, 'An error has occurred. Try again later'],
    ['timeout', 'timeout_error', undefined, 'An error has occurred. Try again later'],
  ].forEach(([description, type, body, message]) => {
    it(`renders an error without redirecting on a ${description}`, async () => {
      if (type === 'resolve') {
        updateStub.resolves(body);
      } else {
        updateStub.rejects(Object.assign(new Error('Request failed'), { type, status: 500, body }));
      }

      await controller(req, res);

      expect(res.render).to.have.been.calledOnceWithExactly('app/aircraft/edit/index', {
        cookie,
        errors: [{ message }],
      });
      expect(res.redirect).not.to.have.been.called;
    });
  });
});
