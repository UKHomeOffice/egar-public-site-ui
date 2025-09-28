/* eslint-env mocha */
/* eslint-disable no-unused-expressions */

import { expect } from 'chai';
import sinon from 'sinon';
import esmock from 'esmock';
import './global.test.js';

describe('DateService', () => {
  it('should successfully get the last successful login date', async () => {
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
    
    const tokenApi = await esmock('../common/services/tokenApi.js', {
      '../common/utils/db.js': dbStub,
    });

    await tokenApi.getLastLogin('test@test.com');
    sinon.assert.calledOnce(findOneStub);
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
    
    const tokenApi = await esmock('../common/services/tokenApi.js', {
      '../common/utils/db.js': dbStub,
    });

    try {
      await tokenApi.getLastLogin('test@test.com');
      // If we get here, the test should fail because an error should have been thrown
      expect.fail('Expected an error to be thrown');
    } catch (err) {
      sinon.assert.calledOnce(findOneStub);
      expect(err.message).to.equal('Example reject getLastLogin');
    }
  });
});