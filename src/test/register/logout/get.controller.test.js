/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */

const sinon = require('sinon');
const { expect } = require('chai');
const chai = require('chai');
const sinonChai = require('sinon-chai');

require('../../global.test');
const CookieModel = require('../../../common/models/Cookie.class');

const controller = require('../../../app/register/logout/get.controller');

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
      expect(res.redirect).to.have.been.calledWith('/login');
    });
  });
});
