/* eslint-env mocha */
/* eslint-disable no-unused-expressions */

const sinon = require('sinon');
const proxyquire = require('proxyquire');

require('./global.test');

const findOneStub = sinon.stub().resolves({
  get() {
    return '2018-12-12 14:24:23.195+00';
  },
});

const dbStub = {
  sequelize: {
    models: {
      UserSessions: {
        findOne: findOneStub,
      },
    },
  },
};

const tokenApi = proxyquire('../common/services/tokenApi', { '../utils/db': dbStub });

describe('DateService', () => {
  it('Should successfully get the last successful login date', (done) => {
    tokenApi.getLastLogin('test@test.com').then(() => {
      sinon.assert.calledOnce(findOneStub);
      done();
    });
  });
});
