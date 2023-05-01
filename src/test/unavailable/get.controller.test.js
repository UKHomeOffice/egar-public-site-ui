/* eslint-disable no-undef */

const sinon = require('sinon');
const { expect } = require('chai');
const chai = require('chai');
const sinonChai = require('sinon-chai');
const controller = require('../../app/unavailable/get.controller');
const availability = require('../../common/config/availability');

require('../global.test');
const CookieModel = require('../../common/models/Cookie.class');

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
