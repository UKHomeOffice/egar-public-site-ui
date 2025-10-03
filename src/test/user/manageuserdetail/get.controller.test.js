const sinon = require('sinon');
const { expect } = require('chai');
const chai = require('chai');
const sinonChai = require('sinon-chai');

require('../../global.test');
const CookieModel = require('../../../common/models/Cookie.class');
const settings = require('../../../common/config/index');
const configMock = {
  ...settings,
  ONE_LOGIN_SHOW_ONE_LOGIN: false,
};

const controller = require('../../../app/user/manageuserdetail/get.controller', {
  '../../../common/config/index': configMock,
});

describe('Manage User Detail Get Controller', () => {
  let req;
  let res;
  const indexPage = settings.ONE_LOGIN_SHOW_ONE_LOGIN
    ? 'app/user/manageuserdetail/index'
    : 'app/user/manageuserdetail/old_index';
  beforeEach(() => {
    chai.use(sinonChai);

    req = {
      session: {},
    };

    res = {
      render: sinon.spy(),
    };
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should render the appropriate page', async () => {
    const cookie = new CookieModel(req);
    await controller(req, res);

    // CookieModel instance created, can that be asserted
    expect(res.render).to.have.been.calledWith(indexPage, { cookie });
  });
});
