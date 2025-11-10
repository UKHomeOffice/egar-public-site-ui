/* eslint-env mocha */

const { expect } = require('chai');
const chai = require('chai');
const nock = require('nock');

require('../../global.test');
const endpoints = require('../../../common/config/endpoints');
const organisationApi = require('../../../common/services/organisationApi');

const BASE_URL = endpoints.baseUrl();

describe('OrganisationService', () => {
  const url = '/organisations';
  const userId = '1be8ed60-fd12-400b-9dc1-350447272199';
  const orgId = '1be8ed60-fd12-400b-9dc1-3504472722222';
  const orgName = 'Capsule Corp';
  const newOrgName = 'NASA';
  const updateUrl = `${url}/${userId}`;
  const updatedOrgUser = {
    userId: '4f732dbb-ba41-4d9b-b0b3-4a7da0f356c4',
    firstName: 'Oshino',
    lastName: 'Shinobu',
    role: 'Manager',
  };

  beforeEach(() => {
    nock(BASE_URL).post(url, { organisationName: orgName, userId }).reply(201, {});

    nock(BASE_URL).put(updateUrl, { organisationName: newOrgName }).reply(201, {});

    nock(BASE_URL).get(`${url}/${orgId}`).reply(200, {});

    nock(BASE_URL).get(`${url}/${orgId}/users`).reply(200, {});

    nock(BASE_URL)
      .patch(`${url}/${orgId}/users`, {
        requesterId: userId,
        users: [updatedOrgUser],
      })
      .reply(200, {});
  });

  it('should successfully get an organisations details', (done) => {
    organisationApi.get(orgId).then((response) => {
      const responseObj = JSON.parse(response);
      expect(typeof responseObj).to.equal('object');
      expect(responseObj).to.be.empty;
      done();
    });
  });

  it('should throw an error when getting an organisations details', () => {
    nock.cleanAll();
    nock(BASE_URL).get(`${url}/${orgId}`).replyWithError({ message: 'Example get error', code: 404 });

    organisationApi
      .get(orgId)
      .then(() => {
        chai.assert.fail('Should not have returned without error');
      })
      .catch((err) => {
        expect(err.message).to.equal('Example get error');
      });
  });

  it('should successfully create an organisation', (done) => {
    organisationApi.create(orgName, userId).then((response) => {
      const responseObj = JSON.parse(response);
      expect(typeof responseObj).to.equal('object');
      expect(responseObj).to.be.empty;
      done();
    });
  });

  it('should throw an error when creating an organisation', () => {
    nock.cleanAll();
    nock(BASE_URL)
      .post(url, { organisationName: orgName, userId })
      .replyWithError({ message: 'Example create error', code: 404 });

    organisationApi
      .create(orgName, userId)
      .then(() => {
        chai.assert.fail('Should not have returned without error');
      })
      .catch((err) => {
        expect(err.message).to.equal('Example create error');
      });
  });

  it('Should successfully update the organisations name', (done) => {
    organisationApi.update(newOrgName, userId).then((response) => {
      const responseObj = JSON.parse(response);
      expect(typeof responseObj).to.equal('object');
      expect(responseObj).to.be.empty;
      done();
    });
  });

  it('should throw an error when updating an organisations name', () => {
    nock.cleanAll();
    nock(BASE_URL)
      .put(updateUrl, { organisationName: newOrgName })
      .replyWithError({ message: 'Example update error', code: 404 });

    organisationApi
      .update(newOrgName, userId)
      .then(() => {
        chai.assert.fail('Should not have returned without error');
      })
      .catch((err) => {
        expect(err.message).to.equal('Example update error');
      });
  });

  it('should successfully get an organisations users', (done) => {
    organisationApi.getUsers(orgId).then((response) => {
      const responseObj = JSON.parse(response);
      expect(typeof responseObj).to.equal('object');
      expect(responseObj).to.be.empty;
      done();
    });
  });

  it('should throw an error when getting an organisations users', () => {
    nock.cleanAll();
    nock(BASE_URL)
      .get(`${url}/${orgId}/users?per_page=10&page=1`)
      .replyWithError({ message: 'Example getUsers error', code: 404 });

    organisationApi
      .getUsers(orgId, 1, 10)
      .then(() => {
        chai.assert.fail('Should not have returned without error');
      })
      .catch((err) => {
        expect(err.message).to.equal('Example getUsers error');
      });
  });

  it('Should successfully edit an organisation users details', (done) => {
    organisationApi.editUser(userId, orgId, updatedOrgUser).then((response) => {
      const responseObj = JSON.parse(response);
      expect(typeof responseObj).to.equal('object');
      expect(responseObj).to.be.empty;
      done();
    });
  });

  it('should throw an error when editing an organisations user', () => {
    nock.cleanAll();
    nock(BASE_URL)
      .patch(`${url}/${orgId}/users`, {
        requesterId: userId,
        users: [updatedOrgUser],
      })
      .replyWithError({ message: 'Example editUser error', code: 404 });

    organisationApi
      .editUser(userId, orgId, updatedOrgUser)
      .then(() => {
        chai.assert.fail('Should not have returned without error');
      })
      .catch((err) => {
        expect(err.message).to.equal('Example editUser error');
      });
  });
});
