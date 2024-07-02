const sinon = require('sinon');
const { expect } = require('chai');
const chai = require('chai');
const sinonChai = require('sinon-chai');

require('../../global.test');

const CookieModel = require('../../../common/models/Cookie.class');
const controller = require('../../../app/resperson/add/get.controller');
const fixedBasedOperatorOptions = require('../../../common/seeddata/fixed_based_operator_options.json');

describe('Responsible Person Add Get Controller', () => {
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

  it('should render the responsible person add index page', async () => {
    cookie = new CookieModel(req);
    
    await controller(req, res);

    expect(res.render).to.have.been.calledWith('app/resperson/add/index', {
      fixedBasedOperatorOptions, cookie,
    });
  });

});