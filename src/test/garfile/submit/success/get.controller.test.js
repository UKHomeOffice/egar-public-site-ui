/* eslint-disable no-undef */

const sinon = require('sinon');
const { expect } = require('chai');
const chai = require('chai');
const sinonChai = require('sinon-chai');

const CookieModel = require('../../../../common/models/Cookie.class');

const controller = require('../../../../app/garfile/submit/success/get.controller');

describe('GAR Submit Success Get Controller', () => {
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

    // Sic: sucess instead of success
    expect(res.render).to.have.been.calledWith('app/garfile/submit/sucess/index', { cookie });
  });
});
