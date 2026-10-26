const sinon = require('sinon');
const { expect } = require('chai');
const chai = require('chai');
const sinonChai = require('sinon-chai');

require('../../global.test');
const CookieModel = require('../../../common/models/Cookie.class');
const roles = require('../../../common/seeddata/egar_user_roles');
const { organisationApi: orgApi } = require('../../../common/services/dataAccessApi');

const controller = require('../../../app/organisation/editusers/get.controller');

describe('Organisation Edit Users Get Controller', () => {
  let req;
  let res;
  let orgApiStub;

  beforeEach(() => {
    chai.use(sinonChai);

    req = {
      session: { editUserId: 'EXAMPLE-EDIT-USER-ID', org: { i: 'ORGANISATION-ID-1' } },
    };

    res = {
      redirect: sinon.spy(),
      render: sinon.spy(),
    };

    orgApiStub = sinon.stub(orgApi, 'getUserById');
  });

  afterEach(() => {
    sinon.restore();
  });

  ['http_error', 'network_error', 'timeout_error'].forEach((type) => {
    it(`redirects with a lookup error on a ${type}`, async () => {
      orgApiStub.rejects(Object.assign(new Error('Request failed'), { type, status: 404 }));

      await controller(req, res);

      expect(orgApiStub).to.have.been.calledOnceWithExactly('EXAMPLE-EDIT-USER-ID');
      expect(req.session.errMsg).to.deep.equal({ message: 'Failed to find user details. Try again' });
      expect(res.redirect).to.have.been.calledOnceWithExactly('/organisation');
      expect(res.render).not.to.have.been.called;
    });
  });

  it('normalizes the role without mutating the returned user object', async () => {
    req.session.u = { rl: 'Admin' };
    const user = { userId: 'EXAMPLE-EDIT-USER-ID', role: { name: 'User' } };
    orgApiStub.resolves(user);

    await controller(req, res);

    expect(user.role).to.deep.equal({ name: 'User' });
    expect(orgApiStub).to.have.been.calledOnceWithExactly('EXAMPLE-EDIT-USER-ID');
    expect(res.redirect).not.to.have.been.called;
    expect(res.render).to.have.been.calledOnceWithExactly('app/organisation/editusers/index', {
      cookie: new CookieModel(req),
      orgUser: { ...user, role: 'User' },
      roles,
    });
  });

  it('redirects if no id set', async () => {
    delete req.session.editUserId;

    await controller(req, res);

    expect(req.session.errMsg).to.be.undefined;
    expect(res.redirect).to.have.been.calledOnceWithExactly('/organisation');
    expect(res.render).to.not.have.been.called;
    expect(orgApiStub).to.not.have.been.called;
  });
});
