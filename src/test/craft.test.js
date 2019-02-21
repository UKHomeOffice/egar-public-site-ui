/* eslint-env mocha */
/* eslint-disable no-unused-expressions */

const expect = require('chai').expect;
const nock = require('nock');
const chai = require('chai');
const settings = require('../common/config');
const endpoints = require('../common/config/endpoints');
const craftApi = require('../common/services/craftApi');

const should = chai.should();

describe('CraftService', () => {
  const userId = '43f70daa-dc2e-4c88-af9c-f0dc1ff13a8e';
  const craftId = '43f70daa-dc2e-4c88-cccc-f0dc1ff13a8e';
  const orgId = '43f70daa-dc2e-9888-cccc-f0dc1ff13a8e';
  const craft = {
    registration: 'C89-yk18',
    craftType: 'Cessna 89',
    craftBase: 'Inverness Airport',
  };
  const newCraft = {
    registration: 'B20-yk10',
    craftType: 'Cessna 89',
    craftBase: 'Inverness Airport',
  };

  const deleteCraft = {
    requesterId: userId,
    crafts: [{ craftId }],
  };

  const BASE_URL = endpoints.baseUrl();

  beforeEach(() => {
    nock(BASE_URL)
      .post(`/user/${userId}/crafts`, craft)
      .reply(201, {
        craftId: '1',
        registration: 'C89-yk18',
        craftType: 'Cessna 89',
        craftBase: 'Inverness Airport',
      });

    nock(BASE_URL)
      .get(`/user/${userId}/crafts/${craftId}`)
      .reply(200, {});

    nock(BASE_URL)
      .get(`/organisations/${orgId}/crafts`)
      .reply(200, {});

    nock(BASE_URL)
      .get(`/user/${userId}/crafts`)
      .reply(200, {});

    nock(BASE_URL)
      .put(`/user/${userId}/crafts/${craftId}`, newCraft)
      .reply(201, {
        craftId: '1',
        registration: 'B20-yk10',
        craftType: 'Cessna 89',
        craftBase: 'Inverness Airport',
      });

    nock(BASE_URL)
      .delete(`/user/${userId}/crafts/${craftId}`, deleteCraft)
      .reply(200, {});

    nock(BASE_URL)
      .delete(`/organisations/${orgId}/crafts`, deleteCraft)
      .reply(200, {});
  });

  it('Should successfully create a craft', (done) => {
    craftApi.create(craft.registration, craft.craftType, craft.craftBase, userId)
      .then((response) => {
        const responseObj = JSON.parse(response);
        expect(typeof responseObj).to.equal('object');
        expect(responseObj).to.have.property('craftId');
        done();
      });
  });

  it("Should successfully list a craft's details", (done) => {
    craftApi.getDetails(userId, craftId)
      .then((response) => {
        const responseObj = JSON.parse(response);
        expect(typeof responseObj).to.equal('object');
        expect(responseObj).to.be.empty;
        done();
      });
  });

  it('Should successfully list all crafts an individual user is able to see', (done) => {
    craftApi.getCrafts(userId)
      .then((response) => {
        const responseObj = JSON.parse(response);
        expect(typeof responseObj).to.equal('object');
        expect(responseObj).to.be.empty;
        done();
      });
  });

  it('Should successfully list all crafts an org user is able to see', (done) => {
    craftApi.getOrgCrafts(orgId)
      .then((response) => {
        const responseObj = JSON.parse(response);
        expect(typeof responseObj).to.equal('object');
        expect(responseObj).to.be.empty;
        done();
      });
  });

  it("Should successfully update a craft's information", (done) => {
    craftApi.update(newCraft.registration, newCraft.craftType, newCraft.craftBase, userId, craftId)
      .then((response) => {
        const responseObj = JSON.parse(response);
        expect(typeof responseObj).to.equal('object');
        expect(responseObj).to.have.property('craftId');
        done();
      });
  });

  it('Should successfully delete a craft', (done) => {
    craftApi.deleteCraft(userId, craftId)
      .then((apiResponse) => {
        const responseObj = JSON.parse(apiResponse);
        expect(typeof responseObj).to.equal('object');
        expect(responseObj).to.be.empty;
        done();
      });
  });

  it('Should successfully delete an organisation craft', (done) => {
    craftApi.deleteOrgCraft(orgId, userId, craftId)
      .then((apiResponse) => {
        const responseObj = JSON.parse(apiResponse);
        expect(typeof responseObj).to.equal('object');
        expect(responseObj).to.be.empty;
        done();
      });
  });
});
