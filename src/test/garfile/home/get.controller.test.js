/* eslint-disable no-undef */

const sinon = require('sinon');
const { expect } = require('chai');
const chai = require('chai');
const sinonChai = require('sinon-chai');

require('../../global.test');
const CookieModel = require('../../../common/models/Cookie.class');
const garoptions = require('../../../common/seeddata/egar_create_gar_options.json');

const controller = require('../../../app/garfile/home/get.controller');

describe('GAR Home Get Controller', () => {
  let req;
  let res;

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
    cookie = new CookieModel(req);

    await controller(req, res);

    expect(res.render).to.have.been.calledOnceWithExactly('app/garfile/home/index', {
      cookie,
      garoptions,
    });
  });
});
