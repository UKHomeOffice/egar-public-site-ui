/* eslint-env mocha */
/* eslint-disable no-unused-expressions */

const { expect } = require('chai');
const sinon = require('sinon');
const proxyquire = require('proxyquire');

require('./global.test');

describe('DateService', () => {
  it('should successfully get the last successful login date', (done) => {
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

    tokenApi.getLastLogin('test@test.com').then(() => {
      sinon.assert.calledOnce(findOneStub);
      done();
    });
  });

  it('should throw an error when getting last successful login date', async () => {
    const findOneStub = sinon.stub().rejects(new Error('Example reject getLastLogin'));
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

    try {
      await tokenApi.getLastLogin('test@test.com');
    } catch (err) {
      sinon.assert.calledOnce(findOneStub);
      expect(err.message).to.equal('Example reject getLastLogin');
    }
  });
});
