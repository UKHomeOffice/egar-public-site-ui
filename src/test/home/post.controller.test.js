/* eslint-disable no-undef */

import sinon from 'sinon';

import { expect } from 'chai';
import chai from 'chai';
import sinonChai from 'sinon-chai';
import '../global.test.js';
import CookieModel from '../../common/models/Cookie.class.js';
import controller from '../../app/home/post.controller.js';

describe('Home Post Controller', () => {
  let req; let res;

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
    cookie = new CookieModel(req);

    await controller(req, res);

    expect(res.render).to.have.been.calledWith('app/garfile/home/index', { cookie });
  });
});
