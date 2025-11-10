const sinon = require('sinon');
const { expect } = require('chai');
const chai = require('chai');
const sinonChai = require('sinon-chai');

require('../../global.test');
const CookieModel = require('../../../common/models/Cookie.class');

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
});
