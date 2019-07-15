/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */

const sinon = require('sinon');
const { expect } = require('chai');
const chai = require('chai');
const sinonChai = require('sinon-chai');

const CookieModel = require('../../../common/models/Cookie.class');
const roles = require('../../../common/seeddata/egar_user_roles');
const orgApi = require('../../../common/services/organisationApi');

const controller = require('../../../app/organisation/editusers/get.controller');

describe('Organisation Edit Users Get Controller', () => {
  let req; let res; let orgApiStub;

  beforeEach(() => {
    chai.use(sinonChai);
    process.on('unhandledRejection', (error) => {
      chai.assert.fail(`Unhandled rejection encountered: ${error}`);
    });

    req = {
      session: { editUserId: 'EXAMPLE-EDIT-USER-ID', org: { i: 'ORGANISATION-ID-1' } },
    };

    res = {
      redirect: sinon.spy(),
      render: sinon.spy(),
    };

    orgApiStub = sinon.stub(orgApi, 'getUsers');
  });

  afterEach(() => {
    sinon.restore();
  });

  it('redirects if no id set', async () => {
    delete req.session.editUserId;

    await controller(req, res);

    expect(req.session.errMsg).to.be.undefined;
    expect(res.redirect).to.have.been.calledOnceWithExactly('/organisation');
    expect(res.render).to.not.have.been.called;
    expect(orgApiStub).to.not.have.been.called;
  });

  // org users
  it('should redirect with error message if api rejects', () => {
    orgApiStub.rejects('orgApiStub.getUsers Example Reject');
    const callController = async () => {
      await controller(req, res);
    };

    callController().then(() => {
      expect(req.session.errMsg).to.eql({ message: 'Failed to find user details. Try again' });
      expect(res.redirect).to.have.been.calledOnceWithExactly('/organisation');
      expect(res.render).to.not.have.been.called;
      expect(orgApiStub).to.have.been.calledOnceWithExactly('ORGANISATION-ID-1');
    });
  });

  it('should render with no users if no match', () => {
    const cookie = new CookieModel(req);

    orgApiStub.resolves(JSON.stringify({
      items: [
        { id: 'PERSON-1', userId: 'EXAMPLE-EDIT-USER-ID-2' },
        { id: 'PERSON-2', userId: 'EXAMPLE-EDIT-USER-ID-2' },
        { id: 'PERSON-3', userId: 'EXAMPLE-EDIT-USER-ID-2' },
        { id: 'PERSON-4', userId: 'EXAMPLE-EDIT-USER-ID-2' },
        { id: 'PERSON-5', userId: 'EXAMPLE-EDIT-USER-ID-2' },
      ],
    }));
    const callController = async () => {
      await controller(req, res);
    };

    callController().then(() => {
      expect(req.session.errMsg).to.be.undefined;
      expect(res.redirect).to.not.have.been.called;
      expect(res.render).to.not.have.been.calledOnceWithExactly('app/organisation/editusers/index', {
        cookie,
        orgUser: [],
        roles,
      });
      expect(orgApiStub).to.have.been.calledOnceWithExactly('ORGANISATION-ID-1');
    });
  });

  it('should render with users if matches', () => {
    const cookie = new CookieModel(req);

    orgApiStub.resolves(JSON.stringify({
      items: [
        { id: 'PERSON-1', userId: 'EXAMPLE-EDIT-USER-ID-2' },
        { id: 'PERSON-2', userId: 'EXAMPLE-EDIT-USER-ID' },
        { id: 'PERSON-3', userId: 'EXAMPLE-EDIT-USER-ID-2' },
        { id: 'PERSON-4', userId: 'EXAMPLE-EDIT-USER-ID-2' },
        { id: 'PERSON-5', userId: 'EXAMPLE-EDIT-USER-ID' },
      ],
    }));
    const callController = async () => {
      await controller(req, res);
    };

    callController().then(() => {
      expect(req.session.errMsg).to.be.undefined;
      expect(res.redirect).to.not.have.been.called;
      expect(res.render).to.not.have.been.calledOnceWithExactly('app/organisation/editusers/index', {
        cookie,
        orgUser: [
          { id: 'PERSON-2', userId: 'EXAMPLE-EDIT-USER-ID' },
          { id: 'PERSON-5', userId: 'EXAMPLE-EDIT-USER-ID' },
        ],
        roles,
      });
      expect(orgApiStub).to.have.been.calledOnceWithExactly('ORGANISATION-ID-1');
    });
  });
});
