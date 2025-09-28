/* eslint-env mocha */
/* eslint-disable no-unused-expressions */

import { expect } from 'chai';
import sinon from 'sinon';
import esmock from 'esmock';
import './global.test.js';

describe('WhiteList', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('Should verify a whitelisted email', async () => {
    const findOneStub = sinon.stub().resolves({
      email: 'oshinos@mail.com',
    });

    const dbStub = {
      sequelize: {
        models: {
          WhiteList: {
            findOne: findOneStub,
          },
        },
      },
    };

    const whitelist = await esmock('../common/services/whiteList.js', {
      '../common/utils/db.js': dbStub,
    });

    const result = await whitelist.isWhitelisted('oshinos@gmail.com');
    
    sinon.assert.calledOnce(findOneStub);
    expect(result).to.be.true;
  });

  it('Should verify a whitelisted email even if uppercased', async () => {
    const findOneStub = sinon.stub().resolves({
      email: 'oshinos@mail.com',
    });

    const dbStub = {
      sequelize: {
        models: {
          WhiteList: {
            findOne: findOneStub,
          },
        },
      },
    };

    const whitelist = await esmock('../common/services/whiteList.js', {
      '../common/utils/db.js': dbStub,
    });

    const result = await whitelist.isWhitelisted('OSHINOS@GMAIL.COM');
    
    sinon.assert.calledOnce(findOneStub);
    expect(result).to.be.true;
  });

  it('Should verify a whitelisted email even if random cased', async () => {
    const findOneStub = sinon.stub().resolves({
      email: 'oshinos@mail.com',
    });

    const dbStub = {
      sequelize: {
        models: {
          WhiteList: {
            findOne: findOneStub,
          },
        },
      },
    };

    const whitelist = await esmock('../common/services/whiteList.js', {
      '../common/utils/db.js': dbStub,
    });

    const result = await whitelist.isWhitelisted('OshINos@gmAIl.com');
    
    sinon.assert.calledOnce(findOneStub);
    expect(result).to.be.true;
  });

  it('Should not verify a non whitelisted email', async () => {
    const findOneStub = sinon.stub().resolves(null);

    const dbStub = {
      sequelize: {
        models: {
          WhiteList: {
            findOne: findOneStub,
          },
        },
      },
    };

    const whitelist = await esmock('../common/services/whiteList.js', {
      '../common/utils/db.js': dbStub,
    });

    const result = await whitelist.isWhitelisted('notthere@gmail.com');
    
    sinon.assert.calledOnce(findOneStub);
    expect(result).to.be.false;
  });

  it('should reject on error', async () => {
    const findOneStub = sinon.stub().rejects(new Error('Example Reject'));

    const dbStub = {
      sequelize: {
        models: {
          WhiteList: {
            findOne: findOneStub,
          },
        },
      },
    };

    const whitelist = await esmock('../common/services/whiteList.js', {
      '../common/utils/db.js': dbStub,
    });

    try {
      await whitelist.isWhitelisted('notthere@gmail.com');
      expect.fail('Should not be resolved');
    } catch (err) {
      sinon.assert.calledOnce(findOneStub);
      expect(err.message).to.eq('Example Reject');
    }
  });
});