/* eslint-disable no-undef */

const sinon = require('sinon');
const { expect } = require('chai');
const chai = require('chai');
const sinonChai = require('sinon-chai');

const CookieModel = require('../../../common/models/Cookie.class');
const userattributes = require('../../../common/seeddata/egar_user_account_details.json');
const garoptions = require('../../../common/seeddata/egar_create_gar_options.json');

const controller = require('../../../app/garfile/home/get.controller');

describe('GAR Home Get Controller', () => {
  let req; let res;

  beforeEach(() => {
    chai.use(sinonChai);
    process.on('unhandledRejection', (error) => {
      chai.assert.fail(`Unhandled rejection encountered: ${error}`);
    });

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

    expect(res.render).to.have.been.calledWith('app/garfile/home/index', {
      cookie, userattributes, garoptions,
    });
  });
});
