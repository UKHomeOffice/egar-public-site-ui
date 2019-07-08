/* eslint-disable no-undef */

const sinon = require('sinon');
const { expect } = require('chai');
const chai = require('chai');
const sinonChai = require('sinon-chai');

const CookieModel = require('../../../common/models/Cookie.class');

const controller = require('../../../app/user/deleteAccount/get.controller');

describe('User Delete Account Get Controller', () => {
  let req; let res;

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
    const cookie = new CookieModel(req);

    await controller(req, res);

    // SIC: deleteAccount instead of deleteaccount
    expect(res.render).to.have.been.calledWith('app/user/deleteAccount/index', { cookie });
  });
});
