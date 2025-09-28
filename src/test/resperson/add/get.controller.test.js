import sinon from 'sinon';
import { expect } from 'chai';
import chai from 'chai';
import sinonChai from 'sinon-chai';
import '../../global.test.js';
import CookieModel from '../../../common/models/Cookie.class.js';
import controller from '../../../app/resperson/add/get.controller.js';
import fixedBasedOperatorOptions from '../../../common/seeddata/fixed_based_operator_options.json' with { type: "json"};

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