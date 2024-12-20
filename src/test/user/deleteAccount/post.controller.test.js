/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */

const sinon = require('sinon');
const { expect } = require('chai');
const chai = require('chai');
const sinonChai = require('sinon-chai');

require('../../global.test');
const CookieModel = require('../../../common/models/Cookie.class');
const userApi = require('../../../common/services/userManageApi');
const emailService = require('../../../common/services/sendEmail');
const settings = require('../../../common/config/index');

const { adminDeletionType } = require('../../../app/user/deleteAccount/utils');
// const controller = require('../../../app/user/deleteAccount/post.controller');

describe('Admin deletion type is correctly determined from organisation users inputted', () => {
  it('Delete organisation if the org users are only 1 admin', () => {
    const orgUsers = [
      { role: { name: 'Admin' } },
    ];

    expect(adminDeletionType(orgUsers)).to.equal('DELETE_ORGANISATION');
  });

  it('Do not delete the admin if there is only 1 admin in an organisation', () => {
    const adminManagerOrgUsers = [
      { role: { name: 'Admin' } },
      { role: { name: 'Manager' } },
    ];

    const adminUserOrgUsers = [
      { role: { name: 'Admin' } },
      { role: { name: 'User' } },
    ];

    const threeOrgUsers = [
      { role: { name: 'Admin' } },
      { role: { name: 'Manager' } },
      { role: { name: 'User' } },
    ];

    expect(adminDeletionType(adminManagerOrgUsers)).to.equal('DO_NOT_DELETE_ADMIN');
    expect(adminDeletionType(adminUserOrgUsers)).to.equal('DO_NOT_DELETE_ADMIN');
    expect(adminDeletionType(threeOrgUsers)).to.equal('DO_NOT_DELETE_ADMIN');
  });

  it('Delete the admin user if there is more than one admin', () => {
    const twoAdmins = [
      { role: { name: 'Admin' } },
      { role: { name: 'Admin' } },
    ];

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
// describe('User Delete Account Post Controller', () => {
//   let req; let res; let userApiStub; let emailServiceStub;

//   beforeEach(() => {
//     chai.use(sinonChai);

//     req = {
//       session: {
//         u: { e: 'exampleuser@somewhere.com', fn: 'Example' },
//       },
//     };

//     res = {
//       render: sinon.stub(),
//       redirect: sinon.stub(),
//     };

//     userApiStub = sinon.stub(userApi, 'deleteUser');
//     emailServiceStub = sinon.stub(emailService, 'send');
//   });

//   afterEach(() => {
//     sinon.restore();
//   });

//   it('should render with error message if api rejects', () => {
//     const cookie = new CookieModel(req);

//     userApiStub.rejects('userApi.deleteUser Example Reject');

//     const callController = async () => {
//       await controller(req, res);
//     };
//     callController().then().then(() => {
//       expect(userApiStub).to.have.been.calledOnceWithExactly('exampleuser@somewhere.com');
//       expect(emailServiceStub).to.not.have.been.called;
//       expect(res.render).to.have.been.calledOnceWithExactly('app/user/deleteAccount/index', {
//         cookie, errors: [{ message: 'Failed to delete your account. Contact support or try again' }],
//       });
//     });
//   });

//   it('should render with error if api returns one', () => {
//     const cookie = new CookieModel(req);

//     userApiStub.resolves(JSON.stringify({
//       message: 'User not found',
//     }));

//     const callController = async () => {
//       await controller(req, res);
//     };
//     callController().then().then(() => {
//       expect(userApiStub).to.have.been.calledOnceWithExactly('exampleuser@somewhere.com');
//       expect(emailServiceStub).to.not.have.been.called;
//       expect(res.render).to.have.been.calledOnceWithExactly('app/user/deleteAccount/index', {
//         cookie, errors: [{ message: 'Failed to delete your account. Contact support or try again' }],
//       });
//     });
//   });

//   it('should render logout if email service rejects', () => {
//     userApiStub.resolves(JSON.stringify({}));
//     emailServiceStub.rejects('emailService.send Example Reject');

//     const callController = async () => {
//       await controller(req, res);
//     };
//     callController().then().then(() => {
//       expect(userApiStub).to.have.been.calledOnceWithExactly('exampleuser@somewhere.com');
//       expect(emailServiceStub).to.have.been.calledWith(settings.NOTIFY_ACCOUNT_DELETE_TEMPLATE_ID, 'exampleuser@somewhere.com', { firstName: 'Example' });
//       expect(res.redirect).to.have.been.calledOnceWithExactly('/user/logout');
//     });
//   });

//   it('should render logout if all ok', () => {
//     userApiStub.resolves(JSON.stringify({}));
//     emailServiceStub.resolves();

//     const callController = async () => {
//       await controller(req, res);
//     };
//     callController().then().then(() => {
//       expect(userApiStub).to.have.been.calledOnceWithExactly('exampleuser@somewhere.com');
//       expect(emailServiceStub).to.have.been.calledWith(settings.NOTIFY_ACCOUNT_DELETE_TEMPLATE_ID, 'exampleuser@somewhere.com', { firstName: 'Example' });
//       expect(res.redirect).to.have.been.calledOnceWithExactly('/user/logout');
//     });
//   });
// });
