/* eslint-disable no-undef */

import sinon from 'sinon';

import { expect } from 'chai';
import chai from 'chai';
import sinonChai from 'sinon-chai';
import '../../global.test.js';
import CookieModel from '../../../common/models/Cookie.class.js';
import garoptions from '../../../common/seeddata/egar_create_gar_options.json' with { type: "json"};
import controller from '../../../app/garfile/home/get.controller.js';

describe('GAR Home Get Controller', () => {
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

  it('should render appropriate page', async () => {
    const cookie = new CookieModel(req);

    await controller(req, res);

    expect(res.render).to.have.been.calledOnceWithExactly('app/garfile/home/index', {
      cookie, garoptions,
    });
  });
});
