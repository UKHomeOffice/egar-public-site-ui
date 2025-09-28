/* eslint-disable no-undef */

import sinon from 'sinon';

import { expect } from 'chai';
import chai from 'chai';
import sinonChai from 'sinon-chai';
import '../../global.test.js';
import CookieModel from '../../../common/models/Cookie.class.js';
import settings from '../../../common/config/index.js';
const configMock = {
  ...settings,
  ONE_LOGIN_SHOW_ONE_LOGIN: false
};

import controller from '../../../app/user/manageuserdetail/get.controller.js';


describe('Manage User Detail Get Controller', () => {
  let req; let res;
  const indexPage = settings.ONE_LOGIN_SHOW_ONE_LOGIN ? 'app/user/manageuserdetail/index' : 'app/user/manageuserdetail/old_index';
  beforeEach(() => {
    chai.use(sinonChai);

    req = {
      session: {
      },
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
