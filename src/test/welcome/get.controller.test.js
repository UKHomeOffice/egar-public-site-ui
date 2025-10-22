/* eslint-disable no-undef */

const sinon = require('sinon');
const { expect } = require('chai');
const chai = require('chai');
const sinonChai = require('sinon-chai');
const proxyrequire = require('proxyquire').noCallThru();
const config = require('../../common/config/index');
const oneLoginApi = require('../../common/utils/oneLoginAuth');

require('../global.test');

describe('Welcome Get Controller', () => {
  let req; let res; let configMock;

  beforeEach(() => {
    chai.use(sinonChai);

    req = {
      get: sinon.stub(),
      cookies: {errorPage: ''},
    };
    res = {
      session: {cookies: {}},
      cookie: sinon.spy(),
      render: sinon.spy(),
    };

    configMock = {
      ...config,
      ONE_LOGIN_POST_MIGRATION: false,
      ONE_LOGIN_SHOW_ONE_LOGIN: false,
      HOMEPAGE_MESSAGE: 'Welcome to the new service',
    }
  });

  afterEach(() => {
    sinon.restore();
    configMock = {}
  });

  it('should render the welcome page', async () => {
    const controller = proxyrequire('../../app/welcome/get.controller', {
        '../../common/config/index': configMock,
    });

    await controller(req, res);

    expect(res.render).to.have.been.calledWith('app/welcome/index');
  });
});
