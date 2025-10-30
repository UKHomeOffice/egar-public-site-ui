const sinon = require('sinon');
const { expect } = require('chai');
const chai = require('chai');
const sinonChai = require('sinon-chai');

require('../../global.test');
let roles = require('../../../common/seeddata/egar_user_roles.json');
const CookieModel = require('../../../common/models/Cookie.class');

const controller = require('../../../app/organisation/assignrole/get.controller');

describe('Organisation Assign Role Get Controller', () => {
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

  it('should render the appropriate page', async () => {
    const cookie = new CookieModel(req);
    cookie.setUserRole('Admin');

    await controller(req, res);

    expect(res.render).to.have.been.calledWith(
      'app/organisation/assignrole/index',
      { cookie, roles }
    );
  });
});
