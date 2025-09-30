/* eslint-disable no-undef */

const sinon = require('sinon');
const { expect } = require('chai');
const chai = require('chai');
const sinonChai = require('sinon-chai');

const i18n = require('i18n');
require('../global.test');
const config = require('../../common/config');
const tokenService = require('../../common/services/create-token');
const verifyUserService = require('../../common/services/verificationApi');
const tokenApi = require('../../common/services/tokenApi');
const sendTokenService = require('../../common/services/send-token');

const controller = require('../../app/verify/get.controller');

describe('Verify Get Controller', () => {
  let req;
  let res;

  beforeEach(() => {
    chai.use(sinonChai);

    req = {
      session: {},
      query: {
        query: 'abcd1234',
      },
    };
    res = {
      render: sinon.spy(),
    };

    // Will need to move or make as accessible fields should the expired
    // token testing be more robust
    sinon.stub(tokenApi, 'updateToken');
    sinon.stub(sendTokenService, 'send');
    sinon.stub(i18n, '__').callsFake((key) => {
      switch (key) {
        case 'verify_user_account_success':
          return 'Example Success Message';
        case 'verify_user_account_token_invalid':
          return 'Example Invalid Token Message';
        case 'verify_user_account_token_expired':
          return 'Example Token Expired Message';
        case 'verify_user_account_token_not_provided':
          return 'Example Token Not Provided Message';
        default:
          return 'Unexpected Key';
      }
    });
    sinon.stub(config, 'NOTIFY_TOKEN_SECRET').value('example_secret');
  });

  afterEach(() => {
    sinon.restore();
  });

  // TODO: Back end can return 'Account already verified'

  // TODO: There is no error message returned when the API has an issue
  // so should probably add one
  it('should render the page when verification api rejects', async () => {
    // Use this test to check the generateHash method
    // i.e. let's ensure crypto is defined!
    const tokenSpy = sinon.spy(tokenService, 'generateHash');
    sinon
      .stub(verifyUserService, 'verifyUser')
      .rejects('verificationApi.verifyUser Example Reject');
    await controller(req, res);

    expect(tokenService.generateHash).to.have.been.calledWith('abcd1234');
    expect(verifyUserService.verifyUser).to.have.been.calledWith(
      tokenSpy.returnValues[0]
    );
    expect(res.render).to.have.been.calledWith('app/verify/registeruser/index');
  });

  it('should return an error message when no user registration token is provided in the verification url', async () => {
    reqNoQuery = {
      session: {},
    };

    await controller(reqNoQuery, res);
    expect(i18n.__).to.have.been.calledWith(
      'verify_user_account_token_not_provided'
    );
    expect(res.render).to.have.been.calledWithExactly(
      'app/verify/registeruser/index',
      { message: 'Example Token Not Provided Message' }
    );
  });

  it('should return with a success message', async () => {
    // Happy path from the API is 'Token verified'
    const apiResponse = {
      message: 'Token verified',
    };
    sinon.stub(tokenService, 'generateHash').returns('hashedTokenExample');
    sinon
      .stub(verifyUserService, 'verifyUser')
      .resolves(JSON.stringify(apiResponse));

    await controller(req, res);

    expect(tokenService.generateHash).to.have.been.calledWith('abcd1234');
    expect(verifyUserService.verifyUser).to.have.been.calledWith(
      'hashedTokenExample'
    );
    expect(i18n.__).to.have.been.calledWith('verify_user_account_success');
    expect(res.render).to.have.been.calledWithExactly(
      'app/verify/registeruser/index',
      { message: 'Example Success Message' }
    );
  });

  it('should return with a token invalid message', async () => {
    const apiResponse = {
      message: 'Token is invalid',
    };
    sinon.stub(tokenService, 'generateHash').returns('hashedTokenExample');
    sinon
      .stub(verifyUserService, 'verifyUser')
      .resolves(JSON.stringify(apiResponse));

    await controller(req, res);

    expect(tokenService.generateHash).to.have.been.calledWith('abcd1234');
    expect(verifyUserService.verifyUser).to.have.been.calledWith(
      'hashedTokenExample'
    );
    expect(i18n.__).to.have.been.calledWith('verify_user_account_success');
    expect(i18n.__).to.have.been.calledWith(
      'verify_user_account_token_invalid'
    );
    expect(res.render).to.have.been.calledWithExactly(
      'app/verify/registeruser/index',
      { message: 'Example Invalid Token Message' }
    );
  });

  it('should return with a token invalid message', async () => {
    const apiResponse = {
      message: 'Token is invalid',
    };
    sinon.stub(tokenService, 'generateHash').returns('hashedTokenExample');
    sinon
      .stub(verifyUserService, 'verifyUser')
      .resolves(JSON.stringify(apiResponse));

    await controller(req, res);

    expect(tokenService.generateHash).to.have.been.calledWith('abcd1234');
    expect(verifyUserService.verifyUser).to.have.been.calledWith(
      'hashedTokenExample'
    );
    expect(i18n.__).to.have.been.calledWith('verify_user_account_success');
    expect(i18n.__).to.have.been.calledWith(
      'verify_user_account_token_invalid'
    );
    expect(res.render).to.have.been.calledWithExactly(
      'app/verify/registeruser/index',
      { message: 'Example Invalid Token Message' }
    );
  });

  // TODO: The block has two asynchronous events with no specific rejection
  // handling. They essentially both need to succeed really so this functionality
  // will need revisiting.
  it('should resend token and return with a token expired message', async () => {
    const apiResponse = {
      userId: '1234',
      firstName: 'Some First Name',
      email: 'someone@somewhere.com',
      message: 'Token has expired',
    };
    const generateHashStub = sinon
      .stub(tokenService, 'generateHash')
      .onCall(0)
      .returns('hashedTokenExample');
    generateHashStub.onCall(1).returns('secondHashedTokenExample');
    sinon
      .stub(verifyUserService, 'verifyUser')
      .resolves(JSON.stringify(apiResponse));

    await controller(req, res);

    expect(generateHashStub).to.have.been.calledWith('abcd1234');
    expect(verifyUserService.verifyUser).to.have.been.calledWith(
      'hashedTokenExample'
    );
    expect(i18n.__).to.have.been.calledWith('verify_user_account_success');
    // Cannot easily mock the nanoid library so easier to stub the generateHash
    // function and retrieve the argument going into it
    const parameter = generateHashStub.getCall(1).args[0];
    expect(generateHashStub).to.have.been.calledWith(parameter);
    expect(tokenApi.updateToken).to.have.been.calledWith(
      'secondHashedTokenExample',
      '1234'
    );
    expect(sendTokenService.send).to.have.been.calledWith(
      'Some First Name',
      'someone@somewhere.com',
      parameter
    );
    expect(i18n.__).to.have.been.calledWith(
      'verify_user_account_token_expired'
    );
    expect(res.render).to.have.been.calledWithExactly(
      'app/verify/registeruser/index',
      { message: 'Example Token Expired Message' }
    );
  });
});
