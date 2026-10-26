const sinon = require('sinon');
const chai = require('chai');

chai.use(require('sinon-chai'));
const { expect } = chai;
require('../../global.test');
const CookieModel = require('../../../common/models/Cookie.class');
const garoptions = require('../../../common/seeddata/egar_create_gar_options.json');
const validator = require('../../../common/utils/validator');
const ValidationRule = require('../../../common/models/ValidationRule.class');
const dataAccessApi = require('../../../common/services/dataAccessApi');
const controller = require('../../../app/garfile/home/post.controller');

describe('GAR Creation Post Controller', () => {
  let req;
  let res;
  let createStub;

  beforeEach(() => {
    req = {
      body: { garoption: '0' },
      session: { u: { dbId: 'user-1' }, save: sinon.stub().callsArg(0) },
    };
    res = { redirect: sinon.spy(), render: sinon.spy() };
    createStub = sinon.stub(dataAccessApi.garApi, 'createGar').resolves({ garId: 'new-gar' });
  });

  afterEach(() => sinon.restore());

  it('renders validation errors without creating a GAR when no option is selected', async () => {
    delete req.body.garoption;

    await controller(req, res);

    expect(createStub).not.to.have.been.called;
    expect(req.session.save).not.to.have.been.called;
    expect(res.redirect).not.to.have.been.called;
    expect(res.render).to.have.been.calledOnceWithExactly('app/garfile/home/index', {
      cookie: new CookieModel(req),
      garoptions,
      errors: [
        new ValidationRule(validator.notEmpty, 'garoption', undefined, 'Select how you would like to create a GAR'),
      ],
    });
  });

  it('redirects to Excel upload without creating a GAR when upload is selected', async () => {
    req.body.garoption = '1';

    await controller(req, res);

    expect(createStub).not.to.have.been.called;
    expect(req.session.save).not.to.have.been.called;
    expect(res.render).not.to.have.been.called;
    expect(res.redirect).to.have.been.calledOnceWithExactly('/garfile/garupload');
  });

  it('stores the created GAR ID and Draft status before saving and redirecting to departure', async () => {
    await controller(req, res);

    expect(createStub).to.have.been.calledOnceWithExactly('user-1');
    const cookie = new CookieModel(req);
    expect(cookie.getGarId()).to.equal('new-gar');
    expect(cookie.getGarStatus()).to.equal('Draft');
    expect(req.session.save).to.have.been.calledOnce;
    expect(res.render).not.to.have.been.called;
    expect(res.redirect).to.have.been.calledOnceWithExactly('/garfile/departure');
    sinon.assert.callOrder(createStub, req.session.save, res.redirect);
  });

  [
    ['message response', { message: 'User cannot create GAR' }],
    ['http_error', { message: 'User cannot create GAR' }],
    ['network_error', null],
  ].forEach(([type, body]) => {
    it(`renders a creation error without setting a GAR or redirecting on a ${type}`, async () => {
      if (type === 'message response') createStub.resolves(body);
      else
        createStub.rejects(
          Object.assign(new Error('Request failed'), {
            type,
            ...(type === 'http_error' ? { status: 400, body } : {}),
          })
        );

      await controller(req, res);

      expect(new CookieModel(req).getGarId()).not.to.exist;
      expect(req.session.save).not.to.have.been.called;
      expect(res.redirect).not.to.have.been.called;
      expect(res.render).to.have.been.calledOnceWithExactly('app/garfile/home/index', {
        cookie: new CookieModel(req),
        garoptions,
        errors: [body || { message: 'Failed to create GAR. Try again' }],
      });
    });
  });
});
