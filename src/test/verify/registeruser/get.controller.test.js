/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */

import sinon from 'sinon';

import { expect } from 'chai';
import chai from 'chai';
import sinonChai from 'sinon-chai';
import '../../global.test.js';
import CookieModel from '../../../common/models/Cookie.class.js';
import tokenService from '../../../common/services/create-token.js';
import verifyUserService from '../../../common/services/verificationApi.js';
import controller from '../../../app/verify/registeruser/get.controller.js';

describe('Verify Register User Get Controller', () => {
  let req; let res;

  beforeEach(() => {
    chai.use(sinonChai);

    req = {
      session: {
      },
      query: {
        token: 'Example Token',
      },
    };

    res = {
      render: sinon.spy(),
    };

    sinon.stub(tokenService, 'generateHash').returns('Token123');
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should render the register user page when user service resolves', async () => {
    sinon.stub(verifyUserService, 'verifyUser').resolves('Example Resolve');
    const cookie = new CookieModel(req);
    await controller(req, res);

    // CookieModel instance created, can that be asserted
    expect(tokenService.generateHash).to.have.been.called;
    expect(verifyUserService.verifyUser).to.have.been.calledWith('Token123');
    expect(res.render).to.have.been.calledWith('app/verify/registeruser/index', { cookie });
  });

  it('should render the register user page with error message when user service rejects', async () => {
    sinon.stub(verifyUserService, 'verifyUser').rejects('Example Reject');
    const cookie = new CookieModel(req);
    try {
      await controller(req, res);
    } catch (err) {
      expect(tokenService.generateHash).to.have.been.called;
      expect(verifyUserService.verifyUser).to.have.been.calledWith('Token123');
      expect(res.render).to.have.been.calledWith('app/verify/registeruser/index', { cookie, message: 'There was an issue verifying your account. Please try again later.' });
    }
  });
});
