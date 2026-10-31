const sinon = require('sinon');
const chai = require('chai');

chai.use(require('sinon-chai'));
const { expect } = chai;
require('../../global.test');
const CookieModel = require('../../../common/models/Cookie.class');
const validator = require('../../../common/utils/validator');
const ValidationRule = require('../../../common/models/ValidationRule.class');
const { userManageApi: userApi } = require('../../../common/services/dataAccessApi');
const controller = require('../../../app/user/manageuserdetail/post.controller');

describe('Manage User Detail Post Controller', () => {
  let req;
  let res;
  let updateStub;

  beforeEach(() => {
    req = {
      body: { firstname: 'Kylo Changed', lastname: 'Ren' },
      session: {
        u: { e: 'kylo.ren@example.com', rl: 'Admin', fn: 'Kylo', ln: 'Ren' },
        save: sinon.stub().callsArg(0),
      },
    };
    res = { redirect: sinon.spy(), render: sinon.spy() };
    updateStub = sinon.stub(userApi, 'updateDetails').resolves({});
  });

  afterEach(() => sinon.restore());

  [
    ['firstname', '', 'Enter your given names'],
    ['firstname', undefined, 'Enter your given names'],
    ['lastname', '', 'Enter your family name'],
  ].forEach(([field, value, message]) => {
    it(`renders validation errors for ${field}=${String(value)} without calling the API`, async () => {
      req.body[field] = value;

      await controller(req, res);

      expect(updateStub).not.to.have.been.called;
      expect(req.session.save).not.to.have.been.called;
      expect(res.redirect).not.to.have.been.called;
      expect(res.render).to.have.been.calledOnceWithExactly('app/user/manageuserdetail/index', {
        cookie: new CookieModel(req),
        errors: [new ValidationRule(validator.isNotEmpty, field, value, message)],
      });
    });
  });

  it('redirects without updating when trimmed names are unchanged', async () => {
    req.body = { firstname: ' Kylo ', lastname: ' Ren ' };

    await controller(req, res);

    expect(updateStub).not.to.have.been.called;
    expect(req.session.save).not.to.have.been.called;
    expect(res.render).not.to.have.been.called;
    expect(res.redirect).to.have.been.calledOnceWithExactly('/user/details');
  });

  it('stores trimmed names and saves a success message before redirecting', async () => {
    req.body.firstname = ' Kylo Changed ';

    await controller(req, res);

    expect(updateStub).to.have.been.calledOnceWithExactly('kylo.ren@example.com', 'Kylo Changed', 'Ren');
    expect(req.session.u.fn).to.equal('Kylo Changed');
    expect(req.session.u.ln).to.equal('Ren');
    expect(req.session.successHeader).to.equal('Success');
    expect(req.session.successMsg).to.equal('You have changed your name');
    expect(req.session.save).to.have.been.calledOnce;
    expect(res.render).not.to.have.been.called;
    expect(res.redirect).to.have.been.calledOnceWithExactly('/user/details');
    sinon.assert.callOrder(updateStub, req.session.save, res.redirect);
  });

  [
    ['message response', null, { message: 'Person does not exist' }],
    ['http_error', 400, { message: 'Person does not exist' }],
    ['network_error', null, null],
  ].forEach(([type, status, body]) => {
    it(`renders the appropriate error without changing names on a ${type}`, async () => {
      if (type === 'message response') {
        updateStub.resolves(body);
      } else {
        updateStub.rejects(Object.assign(new Error('Request failed'), { type, status, body }));
      }

      await controller(req, res);

      expect(req.session.u.fn).to.equal('Kylo');
      expect(req.session.u.ln).to.equal('Ren');
      expect(req.session.successMsg).to.be.undefined;
      expect(req.session.successHeader).to.be.undefined;
      expect(req.session.save).not.to.have.been.called;
      expect(res.redirect).not.to.have.been.called;
      expect(res.render).to.have.been.calledOnceWithExactly('app/user/manageuserdetail/index', {
        cookie: new CookieModel(req),
        errors: [body || { message: 'Failed to update. Try again' }],
      });
    });
  });
});
