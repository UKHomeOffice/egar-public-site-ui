/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */

import sinon from 'sinon';

import { expect } from 'chai';
import chai from 'chai';
import sinonChai from 'sinon-chai';
import '../global.test.js';
import controller from '../../app/welcome/post.controller.js';

describe('Welcome Post Controller', () => {
  let req; let res;

  beforeEach(() => {
    chai.use(sinonChai);

    req = {};
    res = {
      render: sinon.spy(),
      redirect: sinon.spy(),
    };
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should redirect to the login page', async () => {
    await controller(req, res);

    expect(res.render).to.not.have.been.called;
    expect(res.redirect).to.have.been.calledWith('/login');
  });
});
