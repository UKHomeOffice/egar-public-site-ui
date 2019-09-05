/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */

const sinon = require('sinon');
const { expect } = require('chai');
const chai = require('chai');
const sinonChai = require('sinon-chai');

require('../../global.test');
const CookieModel = require('../../../common/models/Cookie.class');
const tokenService = require('../../../common/services/create-token');

const controller = require('../../../app/verify/organisationinvite/get.controller');

describe('Verify Organisation Invite Get Controller', () => {
  let req; let res;

  beforeEach(() => {
    chai.use(sinonChai);

    req = {
      session: {
      },
      query: {
        query: 'Example Incoming Unhashed Token',
      },
    };

    res = {
      render: sinon.spy(),
    };

    sinon.stub(tokenService, 'generateHash').returns('HashedToken123');
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should clear the cookie and set a hashed token before render', async () => {
    const cookie = new CookieModel(req);
    cookie.reset();
    cookie.initialise();
    cookie.setInviteUserToken('HashedToken123');
    cookie.setInviteUserLastName('Example');
    expect(cookie.getInviteUserLastName()).to.equal('Example');

    await controller(req, res);

    // CookieModel instance created, can that be asserted
    expect(tokenService.generateHash).to.have.been.calledOnceWithExactly('Example Incoming Unhashed Token');
    expect(cookie.getInviteUserToken()).to.eq('HashedToken123');
    expect(cookie.getInviteUserLastName()).to.equal(null);
    expect(res.render).to.have.been.calledOnceWithExactly('app/verify/organisationinvite/index');
  });
});
