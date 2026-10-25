const sinon = require('sinon');
const { expect } = require('chai');

require('./global.test');
const dataAccessApi = require('../common/services/dataAccessApi');
const userManageApi = require('../common/services/data-access/userManageApi');

describe('LoginService', () => {
  afterEach(() => sinon.restore());

  it('gets user details through the configured Fetch client', async () => {
    sinon.stub(dataAccessApi.userManageApi, 'getDetails').resolves({
      ok: true,
      firstName: 'Shinobu',
      lastName: 'Oshino',
      email: 'test@mail.com',
    });

    const user = await userManageApi.getDetails('test@mail.com');
    expect(user).to.deep.equal({
      firstName: 'Shinobu',
      lastName: 'Oshino',
      email: 'test@mail.com',
    });
  });
});
