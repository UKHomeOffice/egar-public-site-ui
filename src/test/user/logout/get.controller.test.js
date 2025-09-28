/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */

import sinon from 'sinon';

import { expect } from 'chai';
import chai from 'chai';
import sinonChai from 'sinon-chai';
import '../../global.test.js';
import CookieModel from '../../../common/models/Cookie.class.js';
import controller from '../../../app/user/logout/get.controller.js';

describe('Logout Get Controller', () => {
  let req; let res; let sessionDestroyStub;

  beforeEach(() => {
    chai.use(sinonChai);

    req = {
      session: {
        u: { dbId: 'USER-DB-ID-1' },
        destroy: callback => callback(),
      },
    };
    res = {
      redirect: sinon.spy(),
    };
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should redirect and null session', () => {
    sessionDestroyStub = sinon.stub(req.session, 'destroy').callsArg(0);

    const cookie = new CookieModel(req);
    cookie.reset();

    const callController = async () => {
      await controller(req, res);
    };

    callController().then(() => {
      expect(cookie.session.u).to.be.null;
      expect(sessionDestroyStub).to.have.been.called;
      expect(res.redirect).to.have.been.calledWith('/welcome/index');
    });
  });
});
