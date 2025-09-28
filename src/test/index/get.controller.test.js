/* eslint-disable no-undef */

import sinon from 'sinon';

import { expect } from 'chai';
import chai from 'chai';
import sinonChai from 'sinon-chai';
import '../global.test.js';
import controller from '../../app/index/get.controller.js';

describe('Index Get Controller', () => {
  let req; let res;

  beforeEach(() => {
    chai.use(sinonChai);

    req = {
      session: {},
    };
    res = {
      redirect: sinon.spy(),
    };
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should redirect to the welcome page', async () => {
    await controller(req, res);

    expect(res.redirect).to.have.been.calledWith('/welcome/index');
  });
});
