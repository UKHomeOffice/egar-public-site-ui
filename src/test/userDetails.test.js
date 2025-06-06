/* eslint-env mocha */

const { expect } = require('chai');
const nock = require('nock');

require('./global.test');
const endpoints = require('../common/config/endpoints');

const userManageApi = require('../common/services/userManageApi');

const BASE_URL = endpoints.baseUrl();

describe('LoginService', () => {
  const email = 'test@mail.com';
  const user = { firstName: 'Shinobu', lastName: 'Oshino', email: 'soshino@email.com' };

  beforeEach(() => {
    nock(BASE_URL)
      .get(`/user/${email}`)
      .reply(200, user);
  });

  it('Should get the user details', (done) => {
    userManageApi.getDetails(email)
      .then((response) => {
        const responseObj = response;
        expect(typeof responseObj).to.equal('object');
        expect(responseObj).to.have.keys(['firstName', 'lastName', 'email']);
        done();
      });
  });
});
