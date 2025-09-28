/* eslint-disable no-undef */

import sinon from 'sinon';

import { expect } from 'chai';
import chai from 'chai';
import sinonChai from 'sinon-chai';
import '../../global.test.js';
import CookieModel from '../../../common/models/Cookie.class.js';
import controller from '../../../app/user/register/get.controller.js';

describe('User Register Get Controller', () => {
  let req; let res;

  beforeEach(() => {
    chai.use(sinonChai);

    req = {
      session: {
        u: {
          dbId: 123,
          fn: 'Example first name',
        },
      },
      query: {
        resend: true,
      },
    };

    res = {
      render: sinon.stub(),
    };
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should render the appropriate page', async () => {
    const cookie = new CookieModel(req);
    await controller(req, res);

    expect(res.render).to.have.been.calledWith('app/user/register/index', { cookie });
  });
});
