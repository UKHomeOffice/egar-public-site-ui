/* eslint-env mocha */

const { expect } = require('chai');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const proxyquire = require('proxyquire');
const moment = require('moment');
const nock = require('nock');

require('../../global.test');

const endpoints = require('../../../common/config/endpoints');
const tokenApi = require('../../../common/services/tokenApi');
const genToken = require('../../../common/services/create-token');
const config = require('../../../common/config/index');

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

describe('UserSessions', () => {
  const tokenApiProxy = proxyquire('../../../common/services/tokenApi', { '../utils/db': dbStub });

  before(() => {
    chai.use(sinonChai);
    this.clock = (date) => sinon.useFakeTimers(new Date(date));
    this.clock('2019-04-01');
  });

  it('Should create a usersession entry', (done) => {
    tokenApiProxy.setMfaToken('myemail@email.com', 87654321, true).then(() => {
      sinon.assert.calledOnce(createStub);
      done();
    });
  });

  it('setMfaToken rejects', () => {
    createStub.rejects(new Error('Test'));
    const callSetToken = async () => {
      await tokenApiProxy.setMfaToken('example@email.com', 'tokenId', 'status');
    };

    callSetToken()
      .then(() => {
        chai.assert.fail('Should have rejected');
      })
      .catch((result) => {
        expect(result.message).to.eq('Test');
      });
  });

  it('Should update a usersession entry', (done) => {
    tokenApiProxy.updateMfaToken('myemail@email.com', 87654321).then(() => {
      sinon.assert.calledOnce(updateStub);
      done();
    });
  });

  it('updateMfaToken rejects', () => {
    updateStub.resetHistory();
    updateStub.rejects(new Error('Test Update MFA Token'));
    const callSetToken = async () => {
      await tokenApiProxy.updateMfaToken('myemail@email.com', 87654321);
    };

    callSetToken()
      .then(() => {
        chai.assert.fail('Should have rejected');
      })
      .catch((result) => {
        expect(updateStub).to.have.been.calledOnce;
        expect(result.message).to.eq('Test Update MFA Token');
      });
  });

  it('Should not validate an incorrect token', async () => {
    // Should resolve to null after changes to tokenApi functions made.
    const findOneStubFail = sinon.stub().resolves(false);
    dbStub.sequelize.models.UserSessions.findOne = findOneStubFail;
    try {
      await tokenApiProxy.validateMfaToken('myemail@email.com', 87654322);
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
    const result = await tokenApiProxy.validateMfaToken('myemail@email.com', 87654321);
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
    const result = await tokenApiProxy.validateMfaToken('myemail@email.com', 87654321);
    expect(result).to.equal(true);
  });

  it('should reject an incorrect token match', async () => {
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
      await tokenApiProxy.validateMfaToken('myemail@email.com', 87654322);
    } catch (err) {
      expect(err.message).to.equal('Invalid MFA token');
    }
  });

  it('should reject if sequelize throws an error', async () => {
    const findOneStubFail = sinon.stub().throws(new Error('Not sure what happened'));

    dbStub.sequelize.models.UserSessions.findOne = findOneStubFail;
    try {
      await tokenApiProxy.validateMfaToken('myemail@email.com', 87654322);
    } catch (err) {
      expect(err.message).to.equal('Not sure what happened');
    }
  });

  it('should reject if sequelize rejects', async () => {
    const findOneStubFail = sinon.stub().rejects(new Error('Sequelize reject'));

    dbStub.sequelize.models.UserSessions.findOne = findOneStubFail;
    await tokenApiProxy
      .validateMfaToken('myemail@email.com', 87654322)
      .then()
      .catch((err) => {
        expect(err.message).to.equal('Sequelize reject');
      });
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
      await tokenApiProxy.validateMfaToken('myemail@email.com', 87654321);
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
      await tokenApiProxy.validateMfaToken('myemail@email.com', 87654321);
    } catch (err) {
      expect(err.message).to.equal(`MFA token expired, token is valid for ${MFA_TOKEN_EXPIRY} minutes`);
    }
  });
});

describe('TokenService', () => {
  const url = '/user/settoken';
  const tokenId = '1ebc7b27-ae9f-4962-8bc4-434cdbc6c7ec';
  const newTokenId = '1be8ed60-fd12-400b-9dc1-350447272199';
  const userId = 'a066ca4e-9d08-49e4-8fcc-881daf9f1099';
  const orgId = 'a066ca4e-9d08-49e4-8888-881daf9f1099';
  const roleName = 'Owner';
  const BASE_URL = endpoints.baseUrl();

  beforeEach(() => {
    nock(BASE_URL).post(url, { tokenId, userId }).reply(201, {});

    nock(BASE_URL).put(url, { tokenId: newTokenId, userId }).reply(201, {});

    nock(BASE_URL)
      .post(url, {
        tokenId,
        inviterId: userId,
        organisationId: orgId,
        roleName,
      })
      .reply(201, {});
  });

  it('Should successfully call the settoken API', (done) => {
    tokenApi.setToken(tokenId, userId).then((response) => {
      const responseObj = JSON.parse(response);
      expect(typeof responseObj).to.equal('object');
      expect(responseObj).to.be.empty;
      done();
    });
  });

  it('should throw an error when calling the settoken API', () => {
    nock.cleanAll();
    nock(BASE_URL).post(url, { tokenId, userId }).replyWithError({ message: 'Example setToken error', code: 404 });

    tokenApi
      .setToken(tokenId, userId)
      .then(() => {
        chai.assert.fail('Should not have returned without error');
      })
      .catch((err) => {
        expect(err.message).to.equal('Example setToken error');
      });
  });

  it('should allow the updating of a tokenId', (done) => {
    tokenApi.updateToken(newTokenId, userId).then((response) => {
      const responseObj = JSON.parse(response);
      expect(typeof responseObj).to.equal('object');
      expect(responseObj).to.be.empty;
      done();
    });
  });

  it('should throw an error when updating a tokenId', () => {
    nock.cleanAll();
    nock(BASE_URL)
      .put(url, { tokenId: newTokenId, userId })
      .replyWithError({ message: 'Example updateToken error', code: 404 });

    tokenApi
      .updateToken(newTokenId, userId)
      .then(() => {
        chai.assert.fail('Should not have returned without error');
      })
      .catch((err) => {
        expect(err.message).to.equal('Example updateToken error');
      });
  });

  it('should successfully set the token of an invited org user', (done) => {
    tokenApi.setInviteUserToken(tokenId, userId, orgId, roleName).then((response) => {
      const responseObj = JSON.parse(response);
      expect(typeof responseObj).to.equal('object');
      expect(responseObj).to.be.empty;
      done();
    });
  });

  it('should throw an error when setting the token of an invited org user', () => {
    nock.cleanAll();
    nock(BASE_URL)
      .post(url, {
        tokenId,
        inviterId: userId,
        organisationId: orgId,
        roleName,
      })
      .replyWithError({ message: 'Example setInviteUserToken error', code: 404 });

    tokenApi
      .setInviteUserToken(tokenId, userId, orgId, roleName)
      .then(() => {
        chai.assert.fail('Should not have returned without error');
      })
      .catch((err) => {
        expect(err.message).to.equal('Example setInviteUserToken error');
      });
  });
});

describe('MFATokens', () => {
  it('should successfully generate a token', () => {
    expect(genToken.genMfaToken().toString().length).to.equal(config.MFA_TOKEN_LENGTH);
  });
});

describe('Generate Hash', () => {
  it('should successfully generate a hash', () => {
    config.NOTIFY_TOKEN_SECRET = 'example';
    const token = 'randominput'.toString();
    const output = genToken.generateHash(token);

    expect(output).not.to.equal(token);
    expect(output.length).to.eq(64);
  });
});
