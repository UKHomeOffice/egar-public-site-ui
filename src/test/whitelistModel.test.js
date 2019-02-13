/* eslint-env mocha */
/* eslint-disable no-unused-expressions */

const { expect } = require('chai');
const sinon = require('sinon');
const proxyquire = require('proxyquire');

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
    whitelist.isWhitelisted('oshinos@gmail.com')
      .then((result) => {
        sinon.assert.calledOnce(findOneStub);
        expect(result).to.be.true;
        done();
      });
  });

  it('Should not verify a non whitelisted email', (done) => {
    const findOneStubFail = sinon.stub().resolves(null);
    dbStub.sequelize.models.WhiteList.findOne = findOneStubFail;
    whitelist.isWhitelisted('notthere@gmail.com')
      .then((result) => {
        sinon.assert.calledOnce(findOneStub);
        expect(result).to.be.false;
        done();
      });
  });
});
