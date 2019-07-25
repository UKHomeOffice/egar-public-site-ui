/* eslint-disable no-undef */

const sinon = require('sinon');
const { expect } = require('chai');
const chai = require('chai');
const sinonChai = require('sinon-chai');

require('../global.test');
const CookieModel = require('../../common/models/Cookie.class');

const controller = require('../../app/home/post.controller');

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
