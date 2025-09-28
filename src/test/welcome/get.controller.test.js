/* eslint-disable no-undef */

import sinon from 'sinon';
import { expect } from 'chai';
import chai from 'chai';
import sinonChai from 'sinon-chai';
import esmock from 'esmock';
import config from '../../common/config/index.js';
import oneLoginApi from '../../common/utils/oneLoginAuth.js';
import '../global.test.js';

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
    };
  });

  afterEach(() => {
    sinon.restore();
    configMock = {};
  });

  it('should render the welcome page', async () => {
    const controller = await esmock('../../app/welcome/get.controller.js', {
      '../../common/config/index.js': configMock,
    });

    await controller(req, res);

    expect(res.render).to.have.been.calledWith('app/welcome/index');
  });

  it('should render the post migration page when flag is on', async () => {
    configMock['ONE_LOGIN_POST_MIGRATION'] = true;
    configMock['ONE_LOGIN_SHOW_ONE_LOGIN'] = false;

    sinon.stub(oneLoginApi, 'getOneLoginAuthUrl').returns('https://onelogin.com');

    const controller = await esmock('../../app/welcome/get.controller.js', {
      '../../common/config/index.js': configMock,
    });

    await controller(req, res);

    expect(res.render).to.have.been.calledWith('app/welcome/post_migration_page', {
      HOMEPAGE_MESSAGE: 'Welcome to the new service',
      ONE_LOGIN_POST_MIGRATION: true,
      oneLoginUrl: 'https://onelogin.com',
    });
  });
});