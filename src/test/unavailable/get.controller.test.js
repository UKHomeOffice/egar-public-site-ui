/* eslint-disable no-undef */

import sinon from 'sinon';

import { expect } from 'chai';
import chai from 'chai';
import sinonChai from 'sinon-chai';
import controller from '../../app/unavailable/get.controller.js';
import availability from '../../common/config/availability.js';
import '../global.test.js';
import CookieModel from '../../common/models/Cookie.class.js';

describe('User Login Get Controller', () => {
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
    const cookie = new CookieModel(req);
    sinon.stub(availability, 'ENABLE_UNAVAILABLE_PAGE').value('TRUE');

    await controller(req, res);

    expect(res.render).to.have.been.calledWith('app/unavailable/index', { cookie });
  });
});
