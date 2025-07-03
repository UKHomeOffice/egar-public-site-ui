/* eslint-disable no-undef */

const sinon = require('sinon');
const { expect } = require('chai');
const chai = require('chai');
const sinonChai = require('sinon-chai');
const proxyrequire = require('proxyquire').noCallThru();
const config = require('../../common/config/index');
const oneLoginApi = require('../../common/utils/oneLoginAuth');

let configMock = sinon.stub(config, 'ONE_LOGIN_POST_MIGRATION').value(false);


require('../global.test');
const {HOMEPAGE_MESSAGE} = require("../../common/config");


describe('Welcome Get Controller', () => {
  let req; let res;

  beforeEach(() => {
    chai.use(sinonChai);

    req = {
      get: sinon.stub(),
    };
    res = {
      session: {cookies: {}},
      cookie: sinon.spy(),
      render: sinon.spy(),
    };
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should render the welcome page', async () => {
    const controller = proxyrequire('../../app/welcome/get.controller', {
        '../../../common/config/index': configMock,
    });

    await controller(req, res);

    expect(res.render).to.have.been.calledWith('app/welcome/index');
  });

  it('should render the post migration page when flag is on', async () => {
    configMock.ONE_LOGIN_POST_MIGRATION  = true;
    configMock.ONE_LOGIN_SHOW_ONE_LOGIN  = false;

    sinon.stub(oneLoginApi, 'getOneLoginAuthUrl').returns('https://onelogin.com');

    const controller = proxyrequire('../../app/welcome/get.controller', {
        '../../../common/config/index': configMock,
    });


    await controller(req, res);

    expect(res.render).to.have.been.calledWith('app/welcome/post_migration_page', {
      HOMEPAGE_MESSAGE: undefined,
      ONE_LOGIN_POST_MIGRATION: true,
      oneLoginUrl: 'https://onelogin.com',
    });
  });


});
