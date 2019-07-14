/* eslint-env mocha */
/* eslint-disable no-unused-expressions */

const { expect } = require('chai');
const nock = require('nock');

const endpoints = require('../common/config/endpoints');
const organisationApi = require('../common/services/organisationApi');

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
    nock(BASE_URL)
      .post(url, { organisationName: orgName, userId })
      .reply(201, {});

    nock(BASE_URL)
      .put(updateUrl, { organisationName: newOrgName })
      .reply(201, {});

    nock(BASE_URL)
      .get(`${url}/${orgId}`)
      .reply(200, {});

    nock(BASE_URL)
      .get(`${url}/${orgId}/users`)
      .reply(200, {});

    nock(BASE_URL)
      .patch(`${url}/${orgId}/users`, {
        requesterId: userId,
        users: [
          updatedOrgUser,
        ],
      })
      .reply(200, {});
  });

  it("Should successfully get an organisation's details", (done) => {
    organisationApi.get(orgId)
      .then((response) => {
        const responseObj = JSON.parse(response);
        expect(typeof responseObj).to.equal('object');
        expect(responseObj).to.be.empty;
        done();
      });
  });

  it('Should successfully call the user verification API', (done) => {
    organisationApi.create(orgName, userId)
      .then((response) => {
        const responseObj = JSON.parse(response);
        expect(typeof responseObj).to.equal('object');
        expect(responseObj).to.be.empty;
        done();
      });
  });

  it("Should successfully update the organisation's name", (done) => {
    organisationApi.update(newOrgName, userId)
      .then((response) => {
        const responseObj = JSON.parse(response);
        expect(typeof responseObj).to.equal('object');
        expect(responseObj).to.be.empty;
        done();
      });
  });

  it("Should successfully get the organisation's users", (done) => {
    organisationApi.getUsers(orgId)
      .then((response) => {
        const responseObj = JSON.parse(response);
        expect(typeof responseObj).to.equal('object');
        expect(responseObj).to.be.empty;
        done();
      });
  });

  it("Should successfully edit an organisation user's details", (done) => {
    organisationApi.editUser(userId, orgId, updatedOrgUser)
      .then((response) => {
        const responseObj = JSON.parse(response);
        expect(typeof responseObj).to.equal('object');
        expect(responseObj).to.be.empty;
        done();
      });
  });
});
