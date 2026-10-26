const sinon = require('sinon');
const chai = require('chai');

chai.use(require('sinon-chai'));
const { expect } = chai;

require('../../global.test');

const { userManageApi: userApi, organisationApi } = require('../../../common/services/dataAccessApi');
const controller = require('../../../app/organisation/delete/get.controller');

describe('Organisation Delete User Get Controller', () => {
  let req;
  let res;
  let getStub;
  let deleteStub;
  let saveStub;
  const user = { userId: 'user-2', firstName: 'Test', lastName: 'User', role: { name: 'User' } };

  beforeEach(() => {
    req = {
      session: {
        u: { dbId: 'requester-1' },
        org: { i: 'org-1' },
        deleteUserId: 'test@example.com',
        save: (callback) => callback(),
      },
    };
    res = { redirect: sinon.spy() };
    getStub = sinon.stub(userApi, 'getDetails').resolves(user);
    deleteStub = sinon.stub(organisationApi, 'deleteUser').resolves({});
    saveStub = sinon.stub(req.session, 'save').callsArg(0);
  });

  afterEach(() => sinon.restore());

  it('redirects without API calls if there is no selected user', async () => {
    delete req.session.deleteUserId;

    await controller(req, res);

    expect(getStub).not.to.have.been.called;
    expect(deleteStub).not.to.have.been.called;
    expect(res.redirect).to.have.been.calledOnceWithExactly('/organisation');
  });

  it('deletes the selected user and saves the success message', async () => {
    await controller(req, res);

    expect(getStub).to.have.been.calledOnceWithExactly('test@example.com');
    expect(deleteStub).to.have.been.calledOnceWithExactly('requester-1', 'org-1', { ...user, role: 'User' });
    expect(req.session.deleteUserId).to.be.undefined;
    expect(req.session.errMsg).to.be.undefined;
    expect(req.session.successHeader).to.equal('Success');
    expect(req.session.successMsg).to.equal('User deleted');
    expect(saveStub).to.have.been.calledOnce;
    expect(res.redirect).to.have.been.calledOnceWithExactly('/organisation');
  });

  it('does not delete or report success when the user lookup rejects', async () => {
    getStub.rejects(
      Object.assign(new Error('Bad Request'), {
        type: 'http_error',
        status: 400,
        body: { message: 'User not registered' },
      })
    );

    await controller(req, res);

    expect(deleteStub).not.to.have.been.called;
    expect(req.session.errMsg).to.deep.equal({ message: 'Failed to delete user. Try again' });
    expect(req.session.successMsg).to.be.undefined;
    expect(req.session.successHeader).to.be.undefined;
    expect(saveStub).to.have.been.calledOnce;
    expect(res.redirect).to.have.been.calledOnceWithExactly('/organisation');
  });
  ['message response', 'http_error', 'network_error', 'timeout_error'].forEach((type) => {
    it(`saves a deletion error without reporting success on a ${type}`, async () => {
      if (type === 'message response') {
        deleteStub.resolves({ message: 'Forbidden' });
      } else {
        deleteStub.rejects(Object.assign(new Error('Request failed'), { type, status: 403 }));
      }

      await controller(req, res);

      expect(req.session.errMsg).to.deep.equal({ message: 'Failed to delete user. Try again' });
      expect(req.session.successHeader).to.be.undefined;
      expect(req.session.successMsg).to.be.undefined;
      expect(saveStub).to.have.been.calledOnce;
      expect(res.redirect).to.have.been.calledOnceWithExactly('/organisation');
    });
  });
});
