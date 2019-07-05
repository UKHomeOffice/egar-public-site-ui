/* eslint-disable no-undef */

const sinon = require('sinon');
const { expect } = require('chai');
const chai = require('chai');
const sinonChai = require('sinon-chai');

const CookieModel = require('../../../common/models/Cookie.class');

const controller = require('../../../app/user/register/get.controller');

describe('User Register Get Controller', () => {
  let req; let res;

  beforeEach(() => {
    chai.use(sinonChai);

    req = {
      session: {
        u: {
          dbId: 123,
          fn: 'Example first name',
        },
      },
      query: {
        resend: true,
      },
    };

    res = {
      render: sinon.stub(),
    };
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should render the appropriate page', async () => {
    const cookie = new CookieModel(req);
    await controller(req, res);

    expect(res.render).to.have.been.calledWith('app/user/register/index', { cookie });
  });
});
