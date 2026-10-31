const sinon = require('sinon');
const { expect } = require('chai');
const chai = require('chai');
const sinonChai = require('sinon-chai');

require('../../global.test');
const CookieModel = require('../../../common/models/Cookie.class');
const { organisationApi: orgApi } = require('../../../common/services/dataAccessApi');
const controller = require('../../../app/organisation/searchusers/get.controller');

describe('Organisation Search Users Get Controller', () => {
  let req;
  let res;
  let orgApiStub;

  beforeEach(() => {
    chai.use(sinonChai);

    req = {
      body: {},
      query: { searchUserName: 'TEST' },
      session: { org: { i: 'ORGANISATION-ID-1' } },
    };

    res = {
      redirect: sinon.spy(),
      render: sinon.spy(),
    };

    orgApiStub = sinon.stub(orgApi, 'getSearchOrgUsers');
  });

  afterEach(() => {
    sinon.restore();
  });

  ['http_error', 'network_error', 'timeout_error'].forEach((type) => {
    it(`redirects with a search error on a ${type}`, async () => {
      orgApiStub.rejects(Object.assign(new Error('Request failed'), { type, status: 503 }));

      await controller(req, res);

      expect(orgApiStub).to.have.been.calledOnceWithExactly('ORGANISATION-ID-1', 'TEST');
      expect(req.session.errMsg).to.deep.equal({ message: 'Failed to fetch user. Try again' });
      expect(res.redirect).to.have.been.calledOnceWithExactly('/organisation');
      expect(res.render).not.to.have.been.called;
    });
  });

  it('renders the returned array without mutating the user objects', async () => {
    const users = [{ userId: 'user-1', role: { name: 'User' } }];
    orgApiStub.resolves(users);

    await controller(req, res);

    expect(users[0]).not.to.have.property('isEditable');
    expect(orgApiStub).to.have.been.calledOnceWithExactly('ORGANISATION-ID-1', 'TEST');
    expect(res.redirect).not.to.have.been.called;
    expect(res.render).to.have.been.calledOnceWithExactly('app/organisation/index', {
      cookie: new CookieModel(req),
      orgUsers: [{ ...users[0], isEditable: false }],
      searchUserName: 'TEST',
    });
  });

  it('redirects if no searchUserName set', async () => {
    delete req.query.searchUserName;

    await controller(req, res);

    expect(req.session.errMsg).to.be.undefined;
    expect(res.redirect).to.have.been.calledOnceWithExactly('/organisation');
    expect(res.render).to.not.have.been.called;
    expect(orgApiStub).to.not.have.been.called;
  });

  it('renders an empty result when no users match the search', async () => {
    orgApiStub.resolves([]);

    await controller(req, res);

    expect(orgApiStub).to.have.been.calledOnceWithExactly('ORGANISATION-ID-1', 'TEST');
    expect(res.redirect).not.to.have.been.called;
    expect(res.render).to.have.been.calledOnceWithExactly('app/organisation/index', {
      cookie: new CookieModel(req),
      orgUsers: [],
      searchUserName: 'TEST',
    });
  });
});
