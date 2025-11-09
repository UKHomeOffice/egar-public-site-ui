/* eslint-env mocha */

const { expect } = require('chai');
const chai = require('chai');
const nock = require('nock');

require('../../global.test');
const endpoints = require('../../../common/config/endpoints');
const userApi = require('../../../common/services/userManageApi');

const BASE_URL = endpoints.baseUrl();

describe('UserGetDetails', () => {
  const email = 'hannibal@ateam.com';
  const user = {
    state: 'verified',
    lastName: 'Smith',
    userId: '0b17f70d-3984-40cd-a8eb-9bfbd32719e4',
    firstName: 'John',
    email: 'hannibal@ateam.com',
  };

  beforeEach(() => {
    nock(BASE_URL).get(`/user/${email}`).reply(200, user);
  });

  it('Should successfully find a user', (done) => {
    userApi.getDetails(email).then((response) => {
      const responseObj = response;
      expect(typeof responseObj).to.equal('object');
      expect(responseObj).to.have.keys(['state', 'firstName', 'lastName', 'userId', 'email']);
      expect(JSON.stringify(responseObj)).to.eq(JSON.stringify(user));
      expect(responseObj.email).to.equal(email);
      done();
    });
  });

  it('should throw an error', () => {
    nock.cleanAll();
    nock(BASE_URL)
      .get(`/user/${email}`)
      .replyWithError({ message: 'Example getDetails error', code: 404 });

    userApi
      .getDetails(email)
      .then(() => {
        chai.assert.fail('Should not have returned without error');
      })
      .catch((err) => {
        expect(err.message).to.equal('Example getDetails error');
      });
  });
});

describe('UserEdit', () => {
  const userId = 'a066ca4e-9d08-49e4-8888-881daf9f1099';
  const firstName = 'Megumin';
  const lastName = 'Surname';

  beforeEach(() => {
    nock(BASE_URL).put(`/user/${userId}`, { firstName, lastName }).reply(201, {});
  });

  it('should successfully update a users details', (done) => {
    userApi.updateDetails(userId, firstName, lastName).then((response) => {
      const responseObj = JSON.parse(response);
      expect(typeof responseObj).to.equal('object');
      expect(responseObj).to.be.empty;
      done();
    });
  });

  it('should throw an error', () => {
    nock.cleanAll();
    nock(BASE_URL)
      .put(`/user/${userId}`, { firstName, lastName })
      .replyWithError({ message: 'Example updateDetails error', code: 404 });

    userApi
      .updateDetails(userId, firstName, lastName)
      .then(() => {
        chai.assert.fail('Should not have returned without error');
      })
      .catch((err) => {
        expect(err.message).to.equal('Example updateDetails error');
      });
  });
});

describe('DeleteUser', () => {
  const email = 'someemail@server.com';

  beforeEach(() => {
    nock(BASE_URL).delete(`/user/${email}`).reply(200, { message: 'User deleted' });
  });

  it('Should successfully delete a user', (done) => {
    userApi.deleteUser(email).then((response) => {
      const responseObj = JSON.parse(response);
      expect(typeof responseObj).to.equal('object');
      expect(responseObj).to.have.keys(['message']);
      done();
    });
  });

  it('should throw an error', () => {
    nock.cleanAll();
    nock(BASE_URL)
      .delete(`/user/${email}`)
      .replyWithError({ message: 'Example deleteUser error', code: 404 });

    userApi
      .deleteUser(email)
      .then(() => {
        chai.assert.fail('Should not have returned without error');
      })
      .catch((err) => {
        expect(err.message).to.equal('Example deleteUser error');
      });
  });
});

describe('SearchUser', () => {
  const email = 'ba@ateam.com';
  const user = {
    state: 'verified',
    lastName: 'Baracas',
    userId: '0b17f70d-3984-40cd-a8eb-9bfbd32719e4',
    firstName: 'Bosco',
    email: 'ba@ateam.com',
  };

  beforeEach(() => {
    nock(BASE_URL).get('/user/search').query({ email }).reply(200, user);
  });

  it('Should successfully find a user', (done) => {
    userApi.userSearch(email).then((response) => {
      const responseObj = response;
      expect(typeof responseObj).to.equal('object');
      expect(responseObj).to.have.keys(['state', 'firstName', 'lastName', 'userId', 'email']);
      expect(JSON.stringify(responseObj)).to.eq(JSON.stringify(user));
      expect(responseObj.email).to.equal(email);
      done();
    });
  });

  it('should throw an error', () => {
    nock.cleanAll();
    nock(BASE_URL)
      .get(`/user/search`)
      .query({ email })
      .replyWithError({ message: 'Example searchUser error', code: 404 });

    userApi
      .userSearch(email)
      .then(() => {
        chai.assert.fail('Should not have returned without error');
      })
      .catch((err) => {
        expect(err.message).to.equal('Example searchUser error');
      });
  });
});
