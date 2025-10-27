/* eslint-disable no-undef */

const sinon = require('sinon');
const { expect } = require('chai');
const chai = require('chai');
const sinonChai = require('sinon-chai');

require('../../global.test');
const CookieModel = require('../../../common/models/Cookie.class');

const controller = require('../../../app/aircraft/add/get.controller');

describe('Aircraft Add Get Controller', () => {
  let req;
  let res;

  beforeEach(() => {
    chai.use(sinonChai);

    // Example request and response objects with appropriate spies
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

    expect(res.render).to.have.been.calledWith('app/aircraft/add/index', {
      cookie,
    });
  });
});
