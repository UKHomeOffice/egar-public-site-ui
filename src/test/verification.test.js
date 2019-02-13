/* eslint-env mocha */
/* eslint-disable no-unused-expressions */

const expect = require('chai').expect;
const nock = require('nock');
const endpoints = require('../common/config/endpoints');
const verificationApi = require('../common/services/verificationApi');

const BASE_URL = endpoints.baseUrl();

describe('VerificationService', () => {
  const url = '/user/verify';
  const tokenId = '1ebc7b27-ae9f-4962-8bc4-434cdbc6c7ec';
  // const userId = 'a066ca4e-9d08-49e4-8fcc-881daf9f1099';

  beforeEach(() => {
    nock(BASE_URL)
      .put(url, { tokenId })
      .reply(201, {});
  });

  it('Should successfully call the user verification API', (done) => {
    verificationApi.verifyUser(tokenId)
      .then((response) => {
        const responseObj = JSON.parse(response);
        expect(typeof responseObj).to.equal('object');
        expect(responseObj).to.be.empty;
        done();
      });
  });
});
