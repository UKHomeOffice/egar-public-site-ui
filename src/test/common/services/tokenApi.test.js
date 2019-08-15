/* eslint-env mocha */
/* eslint-disable no-unused-expressions */

const { expect } = require('chai');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const proxyquire = require('proxyquire');
const moment = require('moment');
const config = require('../../../common/config/index');

require('../../global.test');

const { MFA_TOKEN_EXPIRY, MFA_TOKEN_MAX_ATTEMPTS } = config;
const createStub = sinon.stub().resolves(true);
const updateStub = sinon.stub().resolves(true);
const findOneStub = sinon.stub().resolves({
  get() {
    return '2019-03-01 14:24:23.195+00';
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

const tokenApi = proxyquire('../../../common/services/tokenApi', { '../utils/db': dbStub });

describe('UserSessions', () => {
  beforeEach(() => {
    chai.use(sinonChai);
    this.clock = date => sinon.useFakeTimers(new Date(date));
    this.clock('2019-04-01');
  });

  it('Should create a usersession entry', (done) => {
    tokenApi.setMfaToken('myemail@email.com', 87654321, true)
      .then(() => {
        sinon.assert.calledOnce(createStub);
        done();
      });
  });

  it('setMfaToken rejects', () => {
    createStub.rejects(new Error('Test'));
    const callSetToken = async () => {
      await tokenApi.setMfaToken('example@email.com', 'tokenId', 'status');
    };

    callSetToken().then(() => {
      chai.assert.fail('Should have rejected');
    }).catch((result) => {
      expect(result.message).to.eq('Test');
    });
  });

  it('Should update a usersession entry', (done) => {
    tokenApi.updateMfaToken('myemail@email.com', 87654321)
      .then(() => {
        sinon.assert.calledOnce(updateStub);
        done();
      });
  });

  it('updateMfaToken rejects', () => {
    updateStub.resetHistory();
    updateStub.rejects(new Error('Test Update MFA Token'));
    const callSetToken = async () => {
      await tokenApi.updateMfaToken('myemail@email.com', 87654321);
    };

    callSetToken().then(() => {
      chai.assert.fail('Should have rejected');
    }).catch((result) => {
      expect(updateStub).to.have.been.calledOnce;
      expect(result.message).to.eq('Test Update MFA Token');
    });
  });

  it('Should not validate an incorrect token', async () => {
    // Should resolve to null after changes to tokenApi functions made.
    const findOneStubFail = sinon.stub().resolves(false);
    dbStub.sequelize.models.UserSessions.findOne = findOneStubFail;
    try {
      await tokenApi.validateMfaToken('myemail@email.com', 87654322);
    } catch (err) {
      expect(err.message).to.equal('No MFA token found');
    }
  });

  it('Should validate a new token', async () => {
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
    const result = await tokenApi.validateMfaToken('myemail@email.com', 87654321);
    expect(result).to.equal(true);
  });

  it('Should validate a correctly entered token after 4 incorrect attempts', async () => {
    const findOneStubFail = sinon.stub().resolves({
      get() {
        return moment();
      },
      increment() {
        this.NumAttempts += 1;
      },
      MFAToken: 87654321,
      NumAttempts: 4,
    });
    dbStub.sequelize.models.UserSessions.findOne = findOneStubFail;
    const result = await tokenApi.validateMfaToken('myemail@email.com', 87654321);
    expect(result).to.equal(true);
  });

  it('Should reject a correctly entered token after 5 incorrect attempts', async () => {
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
    try {
      await tokenApi.validateMfaToken('myemail@email.com', 87654321);
    } catch (err) {
      expect(err.message).to.equal(`MFA token verification attempts exceeded, maximum limit ${MFA_TOKEN_MAX_ATTEMPTS}`);
    }
  });

  it('Should reject a correctly entered token that has been expired', async () => {
    const findOneStubExpired = sinon.stub().resolves({
      get() {
        return '2019-03-01 14:24:23.195+00';
      },
      increment() {
        this.NumAttempts += 1;
      },
      MFAToken: 87654321,
      NumAttempts: 3,
    });
    dbStub.sequelize.models.UserSessions.findOne = findOneStubExpired;
    try {
      await tokenApi.validateMfaToken('myemail@email.com', 87654321);
    } catch (err) {
      expect(err.message).to.equal(`MFA token expired, token is valid for ${MFA_TOKEN_EXPIRY} minutes`);
    }
  });
});
