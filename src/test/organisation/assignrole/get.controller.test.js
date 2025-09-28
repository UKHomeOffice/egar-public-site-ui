/* eslint-disable no-undef */

import sinon from 'sinon';

import { expect } from 'chai';
import chai from 'chai';
import sinonChai from 'sinon-chai';
import '../../global.test.js';
import roles from '../../../common/seeddata/egar_user_roles.json' with { type: "json"};
import CookieModel from '../../../common/models/Cookie.class.js';
import controller from '../../../app/organisation/assignrole/get.controller.js';

describe('Organisation Assign Role Get Controller', () => {
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
    cookie.setUserRole('Admin');

    await controller(req, res);

    expect(res.render).to.have.been.calledWith('app/organisation/assignrole/index', { cookie, roles });
  });
});
