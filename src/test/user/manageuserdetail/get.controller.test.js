/* eslint-disable no-undef */

const sinon = require('sinon');
const { expect } = require('chai');
const chai = require('chai');
const sinonChai = require('sinon-chai');

const CookieModel = require('../../../common/models/Cookie.class');

const controller = require('../../../app/user/manageuserdetail/get.controller');

describe('Manage User Detail Get Controller', () => {
  let req; let res;

  beforeEach(() => {
    chai.use(sinonChai);

    // Example request and response objects with appropriate spies
    req = {
      session: {
      },
    };

    res = {
      render: sinon.spy(),
    };
    // Need to figure out how to stub the CookieModel and its constructor,
    // in order to just check it is instantiated
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should render the appropriate page', async () => {
    const cookie = new CookieModel(req);
    await controller(req, res);

    // CookieModel instance created, can that be asserted
    expect(res.render).to.have.been.calledWith('app/user/manageuserdetail/index', { cookie });
  });
});
