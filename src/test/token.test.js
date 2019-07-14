/* eslint-env mocha */
/* eslint-disable no-unused-expressions */

const { expect } = require('chai');
const nock = require('nock');
const endpoints = require('../common/config/endpoints');
const tokenApi = require('../common/services/tokenApi');
const genToken = require('../common/services/create-token');
const settings = require('../common/config/index');

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

  it('Should successfully call the settoken API', (done) => {
    tokenApi.setToken(tokenId, userId)
      .then((response) => {
        const responseObj = JSON.parse(response);
        expect(typeof responseObj).to.equal('object');
        expect(responseObj).to.be.empty;
        done();
      });
  });

  it('Should allow the updating of a tokenId', (done) => {
    tokenApi.updateToken(newTokenId, userId)
      .then((response) => {
        const responseObj = JSON.parse(response);
        expect(typeof responseObj).to.equal('object');
        expect(responseObj).to.be.empty;
        done();
      });
  });

  it('Should successfully set the token of an invited org user', (done) => {
    tokenApi.setInviteUserToken(tokenId, userId, orgId, roleName)
      .then((response) => {
        const responseObj = JSON.parse(response);
        expect(typeof responseObj).to.equal('object');
        expect(responseObj).to.be.empty;
        done();
      });
  });
});

describe('MFATokens', () => {
  it('Should successfully generate a token', () => {
    expect(genToken.genMfaToken().toString().length).to.equal(settings.MFA_TOKEN_LENGTH);
  });
});

describe('Generate Hash', () => {
  it('Should successfully generate a hash', () => {
    settings.NOTIFY_TOKEN_SECRET = 'example';
    const token = 'randominput'.toString();
    const output = genToken.generateHash(token);

    expect(output).not.to.equal(token);
    expect(output.length).to.eq(64);
  });
});
