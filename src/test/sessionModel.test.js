/* eslint-env mocha */
/* eslint-disable no-unused-expressions */

const { expect } = require('chai');
const sinon = require('sinon');
const proxyquire = require('proxyquire');
const moment = require('moment');

require('./global.test');

const createStub = sinon.stub().resolves(true);
const updateStub = sinon.stub().resolves(true);
const findOneStub = sinon.stub().resolves({
  get() {
    return '2018-12-12 14:24:23.195+00';
  },
  increment() {
    this.NumAttempts += 1;
  },
  MFAToken: '87654321',
  NumAttempts: 0,
});

const dbStub = {
  sequelize: {
    models: {
      UserSessions: {
        update: updateStub,
        create: createStub,
        findOne: findOneStub,
      },
    },
  },
};

const tokenApi = proxyquire('../common/services/tokenApi', { '../utils/db': dbStub });

describe('UserSessions', () => {
  it('Should create a usersession entry', (done) => {
    tokenApi.setMfaToken('myemail@email.com', 87654321, true)
      .then(() => {
        sinon.assert.calledOnce(createStub);
        done();
      });
  });

  it('Should update a usersession entry', (done) => {
    tokenApi.updateMfaToken('myemail@email.com', 87654321)
      .then(() => {
        sinon.assert.calledOnce(updateStub);
        done();
      });
  });

  it('Should not validate an old token', (done) => {
    tokenApi.validateMfaToken('myemail@email.com', 87654321)
      .then(() => {
        // Should expect exception to be thrown
        expect(true).to.be.false;
      })
      .catch(() => {
        sinon.assert.calledOnce(findOneStub);
        expect(true).to.be.true;
        done();
      });
  });

  it('Should not validate an incorrect token', (done) => {
    // Should resolve to null after changes to tokenApi functions made.
    const findOneStubFail = sinon.stub().resolves(false);
    dbStub.sequelize.models.UserSessions.findOne = findOneStubFail;
    tokenApi.validateMfaToken('myemail@email.com', 87654322)
      .then(() => {
        expect(false).to.be.true;
      })
      .catch(() => {
        sinon.assert.calledOnce(findOneStub);
        expect(true).to.be.true;
        done();
      });
  });

  it('Should validate a new token', (done) => {
    const findOneStubSucc = sinon.stub().resolves({
      get() {
        return moment();
      },
      increment() {
        this.NumAttempts += 1;
      },
      MFAToken: 87654321,
      NumAttempts: 0,
    });
    dbStub.sequelize.models.UserSessions.findOne = findOneStubSucc;
    tokenApi.validateMfaToken('myemail@email.com', 87654321)
      .then((result) => {
        expect(result).to.be.true;
        done();
      });
  });

  it('Should validate a correctly entered token after 3 incorrect attempts', (done) => {
    const findOneStubFail = sinon.stub().resolves({
      get() {
        return moment();
      },
      increment() {
        this.NumAttempts += 1;
      },
      MFAToken: 87654321,
      NumAttempts: 3,
    });
    dbStub.sequelize.models.UserSessions.findOne = findOneStubFail;
    tokenApi.validateMfaToken('myemail@email.com', 87654321)
      .then((result) => {
        expect(result).to.be.true;
        done();
      });
  });

  it('Should reject a correctly entered token after 5 incorrect attempts', (done) => {
    const findOneStubFail = sinon.stub().resolves({
      get() {
        return moment();
      },
      increment() {
        this.NumAttempts += 1;
      },
      MFAToken: 87654321,
      NumAttempts: 5,
    });
    dbStub.sequelize.models.UserSessions.findOne = findOneStubFail;
    tokenApi.validateMfaToken('myemail@email.com', 87654321)
      .then(() => {
        expect(false).to.be.true;
      })
      .catch(() => {
        expect(true).to.be.true;
        done();
      });
  });
});
