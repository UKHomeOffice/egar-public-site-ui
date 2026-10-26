const sinon = require('sinon');
const chai = require('chai');

chai.use(require('sinon-chai'));
const { expect } = chai;

require('../../global.test');
const CookieModel = require('../../../common/models/Cookie.class');
const dataAccessApi = require('../../../common/services/dataAccessApi');
const controller = require('../../../app/aircraft/edit/get.controller');

describe('Aircraft Edit Get Controller', () => {
  let req;
  let res;
  let getStub;

  beforeEach(() => {
    req = { session: { u: { dbId: 'user-1' }, editCraftId: 'craft-1' } };
    res = { redirect: sinon.spy(), render: sinon.spy() };
    getStub = sinon.stub(dataAccessApi.craftApi, 'getDetails');
  });

  afterEach(() => sinon.restore());

  it('redirects without calling the API if no ID is set', async () => {
    delete req.session.editCraftId;

    await controller(req, res);

    expect(getStub).not.to.have.been.called;
    expect(res.redirect).to.have.been.calledOnceWithExactly('/aircraft');
  });

  ['http_error', 'network_error', 'timeout_error'].forEach((type) => {
    it(`redirects without populating the form on a ${type}`, async () => {
      getStub.rejects(
        Object.assign(new Error('Request failed'), { type, status: 503, body: { message: 'Unavailable' } })
      );

      await controller(req, res);

      expect(getStub).to.have.been.calledOnceWithExactly('user-1', 'craft-1');
      expect(res.redirect).to.have.been.calledOnceWithExactly('/aircraft');
      expect(res.render).not.to.have.been.called;
    });
  });

  it('stores the aircraft object and renders populated fields', async () => {
    const editCraft = { craftId: 'craft-1', registration: 'G-ABCD', craftType: 'Hondajet', craftBase: 'LHR' };
    getStub.resolves(editCraft);

    await controller(req, res);

    const cookie = new CookieModel(req);
    expect(cookie.getEditCraft()).to.deep.equal(editCraft);
    expect(getStub).to.have.been.calledOnceWithExactly('user-1', 'craft-1');
    expect(res.render).to.have.been.calledOnceWithExactly('app/aircraft/edit/index', { cookie });
    expect(res.redirect).not.to.have.been.called;
  });
});
