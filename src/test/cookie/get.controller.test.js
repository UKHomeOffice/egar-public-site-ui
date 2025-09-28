/* eslint-disable no-undef */

import sinon from 'sinon';

import { expect } from 'chai';
import chai from 'chai';
import sinonChai from 'sinon-chai';
import '../global.test.js';
import controller from '../../app/cookie/get.controller.js';

describe('Cookie Get Controller', () => {
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
    await controller(req, res);

    expect(res.render).to.have.been.calledWith('app/cookie/index');
  });
});
