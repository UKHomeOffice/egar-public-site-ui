const sinon = require('sinon');
const { expect } = require('chai');
const chai = require('chai');
const sinonChai = require('sinon-chai');
const proxyquire = require('proxyquire');
const settings = require('../../../common/config/index');

require('../../global.test');

const configMock = {
  ...settings,
  ONE_LOGIN_SHOW_ONE_LOGIN: false,
};

const controller = proxyquire('../../../app/user/detailschanged/get.controller', {
  '../../../common/config/index': configMock,
});

describe('Manage User Detail Get Controller', () => {
  let req;
  let res;

  beforeEach(() => {
    chai.use(sinonChai);

    req = {
      session: {},
    };

    res = {
      render: sinon.spy(),
    };
    // Need to figure out how to stub the CookieModel and its constructor,
    // in order to just check it is instantiated
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should render the appropriate page', async () => {
    await controller(req, res);

    expect(res.render).to.have.been.calledWith('app/user/detailschanged/index');
  });
});
