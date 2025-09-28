/* eslint-disable no-undef */
import sinon from 'sinon';
import { expect } from 'chai';
import chai from 'chai';
import sinonChai from 'sinon-chai';
import esmock from 'esmock';
import settings from '../../../common/config/index.js';
import '../../global.test.js';

describe('Manage User Detail Get Controller', () => {
  let req; let res; let controller;

  const configMock = {
    ...settings,
    ONE_LOGIN_SHOW_ONE_LOGIN: false
  };

  beforeEach(async () => {
    chai.use(sinonChai);

    // Mock the controller with the config dependency
    controller = await esmock('../../../app/user/detailschanged/get.controller.js', {
      '../../../common/config/index.js': configMock
    });

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
    await controller(req, res);

    expect(res.render).to.have.been.calledWith('app/user/detailschanged/index');
  });
});