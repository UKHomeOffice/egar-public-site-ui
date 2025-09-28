/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */
import sinon from 'sinon';

import { expect } from 'chai';
import chai from 'chai';
import sinonChai from 'sinon-chai';
import '../../global.test.js';
import utils from '../../../common/utils/utils.js';
import tokenService from '../../../common/services/create-token.js';
import CookieModel from '../../../common/models/Cookie.class.js';
import sendTokenService from '../../../common/services/send-token.js';
import tokenApi from '../../../common/services/tokenApi.js';
import controller from '../../../app/user/regmsg/get.controller.js';

describe('User Register Message Get Controller', () => {
  let req; let res;

  beforeEach(() => {
    chai.use(sinonChai);

    req = {
      session: {
        u: {
          dbId: 123,
          fn: 'Example first name',
        },
      },
      query: {
        resend: true,
      },
    };

    res = {
      render: sinon.stub(),
    };

    sinon.spy(utils.nanoid);
    sinon.stub(tokenService, 'generateHash').returns('ExampleHash');
    sinon.stub(tokenApi, 'updateToken');
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should not do anything if not a resend query or with no user email set', async () => {
    const blankRequest = {
      session: {},
      query: {},
    };
    const cookie = new CookieModel(blankRequest);
    await controller(blankRequest, res);

    expect(res.render).to.have.been.calledWith('app/user/regmsg/index', { cookie });
  });

  it('should generate a hash and a token and store it when send ok', async () => {
    sinon.stub(sendTokenService, 'send').resolves();

    const cookie = new CookieModel(req);
    await controller(req, res);

    expect(tokenService.generateHash).to.have.been.called;
    expect(sendTokenService.send).to.have.been.called;
    expect(tokenApi.updateToken).to.have.been.calledWith('ExampleHash', 123);
    expect(res.render).to.have.been.calledWith('app/user/regmsg/index', { cookie, resend: true });
  });

  it('should not update token when send has an issue', async () => {
    sinon.stub(sendTokenService, 'send').rejects({ message: 'Example Reject' });

    const cookie = new CookieModel(req);

    try {
      await controller(req, res);
    } catch (err) {
      expect(err.message).to.eq('Example Reject');
      expect(tokenService.generateHash).to.have.been.called;
      expect(sendTokenService.send).to.have.been.called;
      expect(tokenApi.updateToken).to.not.have.been.called;
      expect(res.render).to.have.been.calledWith('app/user/login/index', { cookie });
    }
  });
});
