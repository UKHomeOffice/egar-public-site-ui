const sinon = require('sinon');
const chai = require('chai');

chai.use(require('sinon-chai'));
const { expect } = chai;

require('../global.test');
const CookieModel = require('../../common/models/Cookie.class');
const { resPersonApi } = require('../../common/services/dataAccessApi');
const controller = require('../../app/resperson/get.controller');

describe('Responsible Person Index Get Controller', () => {
  let req;
  let res;
  let cookie;
  let listStub;
  let resPersons;

  beforeEach(() => {
    req = { session: { u: { dbId: 'user-1' } } };
    res = { render: sinon.spy() };
    cookie = new CookieModel(req);
    resPersons = [
      { responsiblePersonId: 'person-1', responsibleGivenName: 'Sally', responsibleSurname: 'Smith' },
      { responsiblePersonId: 'person-2', responsibleGivenName: 'John', responsibleSurname: 'Smith' },
    ];
    listStub = sinon.stub(resPersonApi, 'getResPersons').resolves(resPersons);
  });

  afterEach(() => sinon.restore());

  it('renders the saved responsible-person array', async () => {
    await controller(req, res);

    expect(listStub).to.have.been.calledOnceWithExactly('user-1');
    expect(res.render).to.have.been.calledOnceWithExactly('app/resperson/index', { cookie, resPersons });
  });

  it('renders an empty list', async () => {
    listStub.resolves([]);

    await controller(req, res);

    expect(res.render).to.have.been.calledOnceWithExactly('app/resperson/index', { cookie, resPersons: [] });
  });

  it('renders and clears a session error after fetching the list', async () => {
    req.session.errMsg = { message: 'Example error' };

    await controller(req, res);

    expect(req.session.errMsg).to.be.undefined;
    expect(res.render).to.have.been.calledOnceWithExactly('app/resperson/index', {
      cookie,
      resPersons,
      errors: [{ message: 'Example error' }],
    });
  });

  it('renders and clears a session success message and header', async () => {
    req.session.successMsg = 'Responsible person is deleted';
    req.session.successHeader = 'Success';

    await controller(req, res);

    expect(req.session.successMsg).to.be.undefined;
    expect(req.session.successHeader).to.be.undefined;
    expect(res.render).to.have.been.calledOnceWithExactly('app/resperson/index', {
      cookie,
      resPersons,
      successMsg: 'Responsible person is deleted',
      successHeader: 'Success',
    });
  });

  it('renders the existing error when a successful HTTP response contains a message', async () => {
    listStub.resolves({ message: 'User not registered' });

    await controller(req, res);

    expect(res.render).to.have.been.calledOnceWithExactly('app/resperson/index', {
      cookie,
      resPersons: [],
      errors: [{ message: 'Failed to get saved responsible persons' }],
    });
  });

  ['http_error', 'network_error', 'timeout_error'].forEach((type) => {
    it(`renders a fetch error on a ${type}`, async () => {
      listStub.rejects(
        Object.assign(new Error('Request failed'), { type, status: 503, body: { message: 'Unavailable' } })
      );

      await controller(req, res);

      expect(listStub).to.have.been.calledOnceWithExactly('user-1');
      expect(res.render).to.have.been.calledOnceWithExactly('app/resperson/index', {
        cookie,
        errors: [{ message: 'Failed to get saved responsible persons' }],
      });
    });
  });
});
