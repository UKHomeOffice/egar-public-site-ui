/* eslint-env mocha */
/* eslint-disable no-unused-expressions */

import { expect } from 'chai';
import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import esmock from 'esmock';
import moment from 'moment';
import nock from 'nock';
import '../../global.test.js';
import endpoints from '../../../common/config/endpoints.js';
import tokenApi from '../../../common/services/tokenApi.js';
import genToken from '../../../common/services/create-token.js';
import config from '../../../common/config/index.js';

const { MFA_TOKEN_EXPIRY, MFA_TOKEN_MAX_ATTEMPTS } = config;

describe('UserSessions', () => {
  let tokenApiProxy;
  let createStub;
  let updateStub;
  let findOneStub;

  let clock;

  before(() => {
    chai.use(sinonChai);
    clock = sinon.useFakeTimers(new Date('2019-04-01'));
  });

  after(() => {
    if (clock) {
      clock.restore();
    }
  });

  beforeEach(async () => {
    createStub = sinon.stub().resolves(true);
    updateStub = sinon.stub().resolves(true);
    findOneStub = sinon.stub().resolves({
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

    tokenApiProxy = await esmock('../../../common/services/tokenApi.js', {
      '../../../common/utils/db.js': dbStub,
    });
  });

  afterEach(() => {
    sinon.restore();
  });

  it('Should create a usersession entry', async () => {
    await tokenApiProxy.setMfaToken('myemail@email.com', 87654321, true);
    sinon.assert.calledOnce(createStub);
  });

  it('setMfaToken rejects', async () => {
    createStub.rejects(new Error('Test'));
    
    try {
      await tokenApiProxy.setMfaToken('example@email.com', 'tokenId', 'status');
      chai.assert.fail('Should have rejected');
    } catch (result) {
      expect(result.message).to.eq('Test');
    }
  });

  it('Should update a usersession entry', async () => {
    await tokenApiProxy.updateMfaToken('myemail@email.com', 87654321);
    sinon.assert.calledOnce(updateStub);
  });

  it('updateMfaToken rejects', async () => {
    updateStub.resetHistory();
    updateStub.rejects(new Error('Test Update MFA Token'));
    
    try {
      await tokenApiProxy.updateMfaToken('myemail@email.com', 87654321);
      chai.assert.fail('Should have rejected');
    } catch (result) {
      expect(updateStub).to.have.been.calledOnce;
      expect(result.message).to.eq('Test Update MFA Token');
    }
  });

  it('Should not validate an incorrect token', async () => {
    const findOneStubFail = sinon.stub().resolves(false);
    
    const tokenApiProxyFail = await esmock('../../../common/services/tokenApi.js', {
      '../../../common/utils/db.js': {
        sequelize: {
          models: {
            UserSessions: {
              findOne: findOneStubFail,
            },
          },
        },
      },
    });
    
    try {
      await tokenApiProxyFail.validateMfaToken('myemail@email.com', 87654322);
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
    
    const tokenApiProxySucc = await esmock('../../../common/services/tokenApi.js', {
      '../../../common/utils/db.js': {
        sequelize: {
          models: {
            UserSessions: {
              findOne: findOneStubSucc,
            },
          },
        },
      },
    });
    
    const result = await tokenApiProxySucc.validateMfaToken('myemail@email.com', 87654321);
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
    
    const tokenApiProxyFail = await esmock('../../../common/services/tokenApi.js', {
      '../../../common/utils/db.js': {
        sequelize: {
          models: {
            UserSessions: {
              findOne: findOneStubFail,
            },
          },
        },
      },
    });
    
    const result = await tokenApiProxyFail.validateMfaToken('myemail@email.com', 87654321);
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

    const tokenApiProxyFail = await esmock('../../../common/services/tokenApi.js', {
      '../../../common/utils/db.js': {
        sequelize: {
          models: {
            UserSessions: {
              findOne: findOneStubFail,
            },
          },
        },
      },
    });
    
    try {
      await tokenApiProxyFail.validateMfaToken('myemail@email.com', 87654322);
    } catch (err) {
      expect(err.message).to.equal('Invalid MFA token');
    }
  });

  it('should reject if sequelize throws an error', async () => {
    const findOneStubFail = sinon.stub().throws(new Error('Not sure what happened'));

    const tokenApiProxyFail = await esmock('../../../common/services/tokenApi.js', {
      '../../../common/utils/db.js': {
        sequelize: {
          models: {
            UserSessions: {
              findOne: findOneStubFail,
            },
          },
        },
      },
    });
    
    try {
      await tokenApiProxyFail.validateMfaToken('myemail@email.com', 87654322);
    } catch (err) {
      expect(err.message).to.equal('Not sure what happened');
    }
  });

  it('should reject if sequelize rejects', async () => {
    const findOneStubFail = sinon.stub().rejects(new Error('Sequelize reject'));

    const tokenApiProxyFail = await esmock('../../../common/services/tokenApi.js', {
      '../../../common/utils/db.js': {
        sequelize: {
          models: {
            UserSessions: {
              findOne: findOneStubFail,
            },
          },
        },
      },
    });
    
    try {
      await tokenApiProxyFail.validateMfaToken('myemail@email.com', 87654322);
    } catch (err) {
      expect(err.message).to.equal('Sequelize reject');
    }
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

    const tokenApiProxyFail = await esmock('../../../common/services/tokenApi.js', {
      '../../../common/utils/db.js': {
        sequelize: {
          models: {
            UserSessions: {
              findOne: findOneStubFail,
            },
          },
        },
      },
    });
    
    try {
      await tokenApiProxyFail.validateMfaToken('myemail@email.com', 87654321);
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
    
    const tokenApiProxyExpired = await esmock('../../../common/services/tokenApi.js', {
      '../../../common/utils/db.js': {
        sequelize: {
          models: {
            UserSessions: {
              findOne: findOneStubExpired,
            },
          },
        },
      },
    });
    
    try {
      await tokenApiProxyExpired.validateMfaToken('myemail@email.com', 87654321);
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
    nock(BASE_URL)
      .post(url, { tokenId, userId })
      .reply(201, {});

    nock(BASE_URL)
      .put(url, { tokenId: newTokenId, userId })
      .reply(201, {});

    nock(BASE_URL)
      .post(url, {
        tokenId, inviterId: userId, organisationId: orgId, roleName,
      })
      .reply(201, {});
  });

  it('Should successfully call the settoken API', async () => {
    const response = await tokenApi.setToken(tokenId, userId);
    const responseObj = JSON.parse(response);
    expect(typeof responseObj).to.equal('object');
    expect(responseObj).to.be.empty;
  });

  it('should throw an error when calling the settoken API', async () => {
    nock.cleanAll();
    nock(BASE_URL)
      .post(url, { tokenId, userId })
      .replyWithError({ message: 'Example setToken error', code: 404 });

    try {
      await tokenApi.setToken(tokenId, userId);
      chai.assert.fail('Should not have returned without error');
    } catch (err) {
      expect(err.message).to.equal('Example setToken error');
    }
  });

  it('should allow the updating of a tokenId', async () => {
    const response = await tokenApi.updateToken(newTokenId, userId);
    const responseObj = JSON.parse(response);
    expect(typeof responseObj).to.equal('object');
    expect(responseObj).to.be.empty;
  });

  it('should throw an error when updating a tokenId', async () => {
    nock.cleanAll();
    nock(BASE_URL)
      .put(url, { tokenId: newTokenId, userId })
      .replyWithError({ message: 'Example updateToken error', code: 404 });

    try {
      await tokenApi.updateToken(newTokenId, userId);
      chai.assert.fail('Should not have returned without error');
    } catch (err) {
      expect(err.message).to.equal('Example updateToken error');
    }
  });

  it('should successfully set the token of an invited org user', async () => {
    const response = await tokenApi.setInviteUserToken(tokenId, userId, orgId, roleName);
    const responseObj = JSON.parse(response);
    expect(typeof responseObj).to.equal('object');
    expect(responseObj).to.be.empty;
  });

  it('should throw an error when setting the token of an invited org user', async () => {
    nock.cleanAll();
    nock(BASE_URL)
      .post(url, {
        tokenId, inviterId: userId, organisationId: orgId, roleName,
      })
      .replyWithError({ message: 'Example setInviteUserToken error', code: 404 });

    try {
      await tokenApi.setInviteUserToken(tokenId, userId, orgId, roleName);
      chai.assert.fail('Should not have returned without error');
    } catch (err) {
      expect(err.message).to.equal('Example setInviteUserToken error');
    }
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