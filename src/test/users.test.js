/* eslint-env mocha */
/* eslint-disable no-unused-expressions */

const { expect } = require('chai');
const nock = require('nock');
const endpoints = require('../common/config/endpoints');
const registerApi = require('../common/services/createUserApi');
const userApi = require('../common/services/userManageApi');

const BASE_URL = endpoints.baseUrl();

describe('UserCreationService', () => {
  const user = {
    firstName: 'Shinobu',
    lastName: 'Oshino',
    email: 'soshino@email.com',
  };

  it('Should create a user and return the tokenId', (done) => {
    nock(BASE_URL)
      .post('/user/register', user)
      .reply(201, { tokenId: '43f70daa-dc2e-4c88-af9c-f0dc1ff13a8e' });

    registerApi.post(user.firstName, user.lastName, user.email)
      .then((response) => {
        const responseObj = JSON.parse(response);
        expect(typeof responseObj).to.equal('object');
        expect(responseObj).to.have.keys(['tokenId']);
        done();
      });
  });

  it('Should not create a user that already exists', (done) => {
    nock(BASE_URL)
      .post('/user/register', user)
      .reply(400, { message: 'User already registered' });

    registerApi.post(user.firstName, user.lastName, user.email)
      .then((response) => {
        const responseObj = JSON.parse(response);
        expect(typeof responseObj).to.equal('object');
        expect(responseObj).to.have.keys(['message']);
        expect(responseObj.message).to.eq('User already registered');
        done();
      });
  });

  it('Should enforce mandatory fields', (done) => {
    const badUser = {
      firstName: 'Shinobu',
      lastName: 'Oshino',
    };
    nock(BASE_URL)
      .post('/user/register', badUser)
      .reply(400, { message: { email: 'This field is required' } });

    registerApi.post(user.firstName, user.lastName)
      .then((response) => {
        const responseObj = JSON.parse(response);
        expect(typeof responseObj).to.equal('object');
        expect(responseObj).to.have.keys(['message']);
        expect(responseObj.message.email).to.eq('This field is required');
        done();
      });
  });

  it('Should successfully create an organisational user', (done) => {
    const orgUser = {
      firstName: 'Shinobu',
      lastName: 'Oshino',
      email: 'soshino@email.com',
      tokenId: '1be8ed60-fd12-400b-9dc1-350447272199',
    };

    nock(BASE_URL)
      .post('/user/register', orgUser)
      .reply(201, { tokenId: '43f70daa-dc2e-4c88-af9c-f0dc1ff13aae' });

    registerApi.post(orgUser.firstName, orgUser.lastName, orgUser.email, orgUser.tokenId)
      .then((response) => {
        const responseObj = JSON.parse(response);
        expect(typeof responseObj).to.equal('object');
        expect(responseObj).to.have.keys(['tokenId']);
        done();
      });
  });
});

describe('UserEdit', () => {
  const userId = 'a066ca4e-9d08-49e4-8888-881daf9f1099';
  const firstName = 'Megumin';
  const lastName = 'Surname';

  beforeEach(() => {
    nock(BASE_URL)
      .put(`/user/${userId}`, { firstName, lastName })
      .reply(201, {});
  });

  it('Should successfully update a users details', (done) => {
    userApi.updateDetails(userId, firstName, lastName)
      .then((response) => {
        const responseObj = JSON.parse(response);
        expect(typeof responseObj).to.equal('object');
        expect(responseObj).to.be.empty;
        done();
      });
  });
});

describe('DeleteUser', () => {
  const email = 'someemail@server.com';

  nock(BASE_URL)
    .delete(`/user/${email}`)
    .reply(200, { message: 'User deleted' });

  it('Should successfully delete a user', (done) => {
    userApi.deleteUser(email)
      .then((response) => {
        const responseObj = JSON.parse(response);
        expect(typeof responseObj).to.equal('object');
        expect(responseObj).to.have.keys(['message']);
        done();
      });
  });
});
