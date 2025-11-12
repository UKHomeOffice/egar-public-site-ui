/* eslint-env mocha */

const { expect } = require('chai');
const sinon = require('sinon');
const proxyquire = require('proxyquire');

require('./global.test');

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

// In the whitelist service file, replace the db import with our stub
const whitelist = proxyquire('../common/services/whiteList', { '../utils/db': dbStub });

describe('WhiteList', () => {
  it('Should verify a whitelisted email', (done) => {
    whitelist.isWhitelisted('oshinos@gmail.com').then((result) => {
      sinon.assert.calledOnce(findOneStub);
      expect(result).to.be.true;
      findOneStub.resetHistory();
      done();
    });
  });

  it('Should verify a whitelisted email even if uppercased', (done) => {
    whitelist.isWhitelisted('OSHINOS@GMAIL.COM').then((result) => {
      sinon.assert.calledOnce(findOneStub);
      expect(result).to.be.true;
      findOneStub.resetHistory();
      done();
    });
  });

  it('Should verify a whitelisted email even if random cased', (done) => {
    whitelist.isWhitelisted('OshINos@gmAIl.com').then((result) => {
      sinon.assert.calledOnce(findOneStub);
      expect(result).to.be.true;
      findOneStub.resetHistory();
      done();
    });
  });

  it('Should not verify a non whitelisted email', (done) => {
    const findOneStubFail = sinon.stub().resolves(null);
    dbStub.sequelize.models.WhiteList.findOne = findOneStubFail;
    whitelist.isWhitelisted('notthere@gmail.com').then((result) => {
      sinon.assert.calledOnce(findOneStubFail);
      expect(result).to.be.false;
      done();
    });
  });

  it('should reject on error', (done) => {
    const findOneStubFail = sinon.stub().rejects(new Error('Example Reject'));
    dbStub.sequelize.models.WhiteList.findOne = findOneStubFail;
    whitelist
      .isWhitelisted('notthere@gmail.com')
      .then(() => {
        sinon.assert.fail('Should not be resolved');
      })
      .catch((err) => {
        sinon.assert.calledOnce(findOneStubFail);
        expect(err.message).to.eq('Example Reject');
        done();
      });
  });
});
