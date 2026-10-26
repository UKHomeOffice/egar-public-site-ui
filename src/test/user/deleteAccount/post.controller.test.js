const sinon = require('sinon');
const { expect } = require('chai');
const chai = require('chai');
const sinonChai = require('sinon-chai');

require('../../global.test');
const CookieModel = require('../../../common/models/Cookie.class');
const dataAccessApi = require('../../../common/services/dataAccessApi');
const userApi = require('../../../common/services/data-access/userManageApi');
const sendEmail = require('../../../common/services/sendEmail');
const config = require('../../../common/config');

const { adminDeletionType, deleteAccount } = require('../../../app/user/deleteAccount/utils');
const controller = require('../../../app/user/deleteAccount/post.controller');

describe('Admin deletion type is correctly determined from organisation users inputted', () => {
  it('Delete organisation if the org users are only 1 admin', () => {
    const orgUsers = [{ role: { name: 'Admin' } }];

    expect(adminDeletionType(orgUsers)).to.equal('DELETE_ORGANISATION');
  });

  it('Do not delete the admin if there is only 1 admin in an organisation', () => {
    const adminManagerOrgUsers = [{ role: { name: 'Admin' } }, { role: { name: 'Manager' } }];

    const adminUserOrgUsers = [{ role: { name: 'Admin' } }, { role: { name: 'User' } }];

    const threeOrgUsers = [{ role: { name: 'Admin' } }, { role: { name: 'Manager' } }, { role: { name: 'User' } }];

    expect(adminDeletionType(adminManagerOrgUsers)).to.equal('DO_NOT_DELETE_ADMIN');
    expect(adminDeletionType(adminUserOrgUsers)).to.equal('DO_NOT_DELETE_ADMIN');
    expect(adminDeletionType(threeOrgUsers)).to.equal('DO_NOT_DELETE_ADMIN');
  });

  it('Delete the admin user if there is more than one admin', () => {
    const twoAdmins = [{ role: { name: 'Admin' } }, { role: { name: 'Admin' } }];

    const anyOtherCombinationOfUsers = [
      { role: { name: 'Admin' } },
      { role: { name: 'Admin' } },
      { role: { name: 'Manager' } },
      { role: { name: 'Manager' } },
      { role: { name: 'User' } },
      { role: { name: 'Admin' } },
      { role: { name: 'Admin' } },
      { role: { name: 'Manager' } },
      { role: { name: 'User' } },
    ];

    expect(adminDeletionType(twoAdmins)).to.equal('DELETE_ADMIN');
    expect(adminDeletionType(anyOtherCombinationOfUsers)).to.equal('DELETE_ADMIN');
  });
});

describe('User Delete Account Post Controller', () => {
  let req;
  let res;
  let deleteOptionStub;
  let textStub;
  let deleteAccountStub;
  let notifyUserStub;
  const userRole = 'User';

  beforeEach(() => {
    chai.use(sinonChai);

    req = {
      session: {
        u: { e: 'exampleuser@somewhere.com', rl: userRole, fn: 'Example' },
        destroy: (callback) => {
          callback();
        },
      },
    };

    res = {
      render: sinon.stub(),
      redirect: sinon.stub(),
      locals: {},
    };

    deleteOptionStub = sinon.stub(deleteAccount, userRole);
    textStub = sinon.stub();
    deleteAccountStub = sinon.stub();
    notifyUserStub = sinon.stub();

    deleteOptionStub.onFirstCall().resolves({
      text: textStub,
      deleteAccount: deleteAccountStub,
      notifyUser: notifyUserStub,
    });
  });

  describe('Admin organisation account deletion through dataAccessApi', () => {
    let req;
    let res;
    let listStub;
    let deleteStub;
    let deleteUserStub;
    let notifyStub;
    let destroyStub;

    beforeEach(() => {
      req = {
        session: {
          u: { dbId: 'admin-1', e: 'admin@example.com', rl: 'Admin', fn: 'Test', ln: 'Admin' },
          org: { i: 'org-1', name: 'Test organisation' },
          id_token: 'test-id-token',
          destroy: (callback) => callback(),
        },
      };
      res = { render: sinon.spy(), redirect: sinon.spy(), locals: {} };
      listStub = sinon.stub(dataAccessApi.organisationApi, 'getListOfOrgUsers').resolves({
        items: [{ userId: 'admin-1', role: { name: 'Admin' } }],
      });
      deleteStub = sinon.stub(dataAccessApi.organisationApi, 'delete').resolves({});
      deleteUserStub = sinon.stub(userApi, 'deleteUser').resolves(JSON.stringify({}));
      notifyStub = sinon.stub(sendEmail, 'send').resolves();
      destroyStub = sinon.stub(req.session, 'destroy').callsArg(0);
    });

    it('deletes a sole-admin organisation using the object response before notifying and logging out', async () => {
      await controller(req, res);

      expect(listStub).to.have.been.calledOnceWithExactly('org-1');
      expect(deleteStub).to.have.been.calledOnceWithExactly('org-1', 'admin-1');
      expect(deleteUserStub).not.to.have.been.called;
      expect(notifyStub).to.have.been.calledOnceWithExactly(
        config.NOTIFY_ORGANISATION_DELETE_TEMPLATE_ID,
        'admin@example.com',
        { firstName: 'Test', orgName: 'Test organisation' }
      );
      sinon.assert.callOrder(listStub, deleteStub, notifyStub, res.redirect);
      expect(destroyStub).not.to.have.been.called;
      expect(res.redirect).to.have.been.calledOnceWithExactly('/user/logout?action=user-deleted');
      expect(res.render).not.to.have.been.called;
    });

    it('does not delete the last admin when other organisation users remain', async () => {
      listStub.resolves({ items: [{ role: { name: 'Admin' } }, { role: { name: 'User' } }] });

      await controller(req, res);

      expect(deleteStub).not.to.have.been.called;
      expect(deleteUserStub).not.to.have.been.called;
      expect(notifyStub).not.to.have.been.called;
      expect(destroyStub).not.to.have.been.called;
      expect(res.redirect).not.to.have.been.called;
      expect(res.render).to.have.been.calledOnceWithExactly('app/user/deleteAccount/index', {
        cookie: new CookieModel(req),
        errors: [
          {
            message:
              'Please add another Admin account before deleting your account or confirm to delete your Account and the Organisation',
          },
        ],
      });
    });

    it('uses the unchanged user-deletion path when another admin remains', async () => {
      listStub.resolves({ items: [{ role: { name: 'Admin' } }, { role: { name: 'Admin' } }] });

      await controller(req, res);

      expect(deleteStub).not.to.have.been.called;
      expect(deleteUserStub).to.have.been.calledOnceWithExactly('admin@example.com', 'admin-1');
      expect(notifyStub).to.have.been.calledOnceWithExactly(
        config.NOTIFY_ACCOUNT_DELETE_TEMPLATE_ID,
        'admin@example.com',
        { firstName: 'Test', lastName: 'Admin' }
      );
      sinon.assert.callOrder(listStub, deleteUserStub, notifyStub, res.redirect);
      expect(res.redirect).to.have.been.calledOnceWithExactly('/user/logout?action=user-deleted');
    });

    it('does not notify or log out when deletion returns a message object', async () => {
      deleteStub.resolves({ message: 'Deletion denied' });

      await controller(req, res);

      expect(notifyStub).not.to.have.been.called;
      expect(destroyStub).not.to.have.been.called;
      expect(res.redirect).not.to.have.been.called;
      expect(res.render).to.have.been.calledOnceWithExactly('app/user/deleteAccount/index', {
        cookie: new CookieModel(req),
        errors: [{ message: 'Deletion denied' }],
      });
    });

    it('preserves the backend deletion message from an HTTP rejection', async () => {
      const body = { message: 'Deletion denied' };
      deleteStub.rejects(Object.assign(new Error('Forbidden'), { type: 'http_error', status: 403, body }));

      await controller(req, res);

      expect(notifyStub).not.to.have.been.called;
      expect(destroyStub).not.to.have.been.called;
      expect(res.redirect).not.to.have.been.called;
      expect(res.render).to.have.been.calledOnceWithExactly('app/user/deleteAccount/index', {
        cookie: new CookieModel(req),
        errors: [body],
      });
    });

    ['list', 'delete'].forEach((operation) => {
      ['http_error', 'network_error', 'timeout_error'].forEach((type) => {
        it(`does not notify or log out on a ${operation} ${type}`, async () => {
          const stub = operation === 'list' ? listStub : deleteStub;
          stub.rejects(Object.assign(new Error('Request failed'), { type, status: 503 }));

          await controller(req, res);

          if (operation === 'list') {
            expect(deleteStub).not.to.have.been.called;
          }
          expect(notifyStub).not.to.have.been.called;
          expect(destroyStub).not.to.have.been.called;
          expect(res.redirect).not.to.have.been.called;
          expect(res.render).to.have.been.calledOnceWithExactly('app/user/deleteAccount/index', {
            cookie: new CookieModel(req),
            errors: [{ message: 'Failed to delete your account. Contact support or try again' }],
          });
        });
      });
    });
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should render with error message if api rejects', async () => {
    const cookie = new CookieModel(req);

    deleteAccountStub.onFirstCall().rejects('Error occured');
    await controller(req, res);

    expect(res.render).to.have.been.calledOnceWithExactly('app/user/deleteAccount/index', {
      cookie,
      errors: [{ message: 'Failed to delete your account. Contact support or try again' }],
    });
  });

  it('should render logout if email service rejects', async () => {
    deleteAccountStub.onFirstCall().resolves(JSON.stringify({}));
    notifyUserStub.onFirstCall().rejects('Error occured');

    await controller(req, res);

    expect(res.redirect).to.have.been.calledOnceWithExactly('/user/deleteconfirm');
  });

  it('should redirect to logout route when session has OneLogin id token', async () => {
    req.session.id_token = 'session-id-token';
    deleteAccountStub.onFirstCall().resolves(JSON.stringify({}));
    notifyUserStub.onFirstCall().resolves();

    await controller(req, res);

    expect(res.redirect).to.have.been.calledOnceWithExactly('/user/logout?action=user-deleted');
  });
});
