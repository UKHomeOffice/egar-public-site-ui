/* eslint-env mocha */
/* eslint-disable no-unused-expressions */

const { expect } = require('chai');
const nock = require('nock');

require('./global.test');
const endpoints = require('../common/config/endpoints');

const verificationApi = require('../common/services/verificationApi');

const BASE_URL = endpoints.baseUrl();

describe('VerificationService', () => {
  const url = '/user/verify';
  const tokenId = '1ebc7b27-ae9f-4962-8bc4-434cdbc6c7ec';

  it('Should successfully call the user verification API', (done) => {
    nock(BASE_URL)
      .put(url, { tokenId })
      .reply(201, {});

    verificationApi.verifyUser(tokenId)
      .then((response) => {
        const responseObj = JSON.parse(response);
        expect(typeof responseObj).to.equal('object');
        expect(responseObj).to.be.empty;
        done();
      });
  });

  // Catch block handles the rejection, and logs an error
  it('Should return a string on error', (done) => {
    nock(BASE_URL)
      .put(url, { tokenId })
      .replyWithError('Example error to test');

    verificationApi.verifyUser(tokenId).then(() => {
      done();
    });
  });
});
