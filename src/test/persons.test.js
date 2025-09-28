/* eslint-env mocha */
/* eslint-disable no-unused-expressions */

import { expect } from 'chai';

import chai from 'chai';
import nock from 'nock';
import './global.test.js';
import personApi from '../common/services/personApi.js';
import endpoints from '../common/config/endpoints.js';

const BASE_URL = endpoints.baseUrl();

describe('PersonService', () => {
  const userId = '43f70daa-dc2e-4c88-af9c-f0dc1ff13a8e';
  const orgId = '43f70daa-dc2e-4c88-af9c-f0dc1ff13a8e';
  const personId = '43f70daa-dc2e-1234-321c-f0dc1ff13a8e';

  const person = {
    firstName: 'Asuka',
    lastName: 'Langley',
    nationality: 'USA',
    placeOfBirth: 'USA',
    dateOfBirth: '1988-12-12',
    gender: 'Male',
    documentType: 'Passport',
    documentNumber: '141231231',
    documentExpiryDate: '2021-12-12',
    peopleType: 'Crew',
    issuingState: 'USA',
  };

  const newPerson = {
    firstName: 'Rei',
    lastName: 'Ayanami',
    nationality: 'USA',
    placeOfBirth: 'USA',
    dateOfBirth: '1988-12-12',
    gender: 'Male',
    documentType: 'Passport',
    documentNumber: '31231231311',
    documentExpiryDate: '2021-01-12',
    peopleType: 'Captain',
    issuingState: 'USA',
  };

  beforeEach(() => {
    nock(BASE_URL)
      .post(`/user/${userId}/people`, person)
      .reply(201, {
        firstName: 'Asuka',
        lastName: 'Langley',
        nationality: 'USA',
        birthplace: 'USA',
        dob: '1988-12-12',
        gender: 'Male',
        peopleType: { name: 'Crew' },
        documentType: 'Passport',
        documentNumber: '141231231',
        issuingState: 'USA',
      });

    nock(BASE_URL)
      .put(`/user/${userId}/people/${personId}`, newPerson)
      .reply(201, {});

    nock(BASE_URL)
      .get(`/user/${userId}/people/${personId}`)
      .reply(200, {});

    nock(BASE_URL)
      .get(`/user/${userId}/people`)
      .reply(200, {});

    nock(BASE_URL)
      .get(`/organisations/${orgId}/people`)
      .reply(200, {});

    nock(BASE_URL)
      .delete(`/user/${userId}/people/${personId}`)
      .reply(200, {});
  });

  it('should successfully create a person for an individual user', (done) => {
    personApi.create(userId, person)
      .then((response) => {
        const responseObj = JSON.parse(response);
        expect(typeof responseObj).to.equal('object');
        expect(responseObj).to.have.property('peopleType');
        done();
      });
  });

  it('should throw an error when creating a person for an individual user', () => {
    nock.cleanAll();
    nock(BASE_URL)
      .post(`/user/${userId}/people`, person)
      .replyWithError({ message: 'Example create error', code: 404 });

    personApi.create(userId, person).then(() => {
      chai.assert.fail('Should not have returned without error');
    }).catch((err) => {
      expect(err.message).to.equal('Example create error');
    });
  });

  it('Should successfully get the details of a saved person', (done) => {
    personApi.getDetails(userId, personId)
      .then((response) => {
        const responseObj = JSON.parse(response);
        expect(typeof responseObj).to.equal('object');
        expect(responseObj).to.be.empty;
        done();
      });
  });

  it('should throw an error when getting the details of a saved person', () => {
    nock.cleanAll();
    nock(BASE_URL)
      .get(`/user/${userId}/people/${personId}`)
      .replyWithError({ message: 'Example getDetails error', code: 404 });

    personApi.getDetails(userId, personId).then(() => {
      chai.assert.fail('Should not have returned without error');
    }).catch((err) => {
      expect(err.message).to.equal('Example getDetails error');
    });
  });

  it('should successfully get all the saved people for an individual', (done) => {
    personApi.getPeople(userId, 'individual')
      .then((response) => {
        const responseObj = JSON.parse(response);
        expect(typeof responseObj).to.equal('object');
        done();
      });
  });

  it('should throw an error when getting all the saved people for an individual', () => {
    nock.cleanAll();
    nock(BASE_URL)
      .get(`/user/${userId}/people`)
      .replyWithError({ message: 'Example getPeople error', code: 404 });

    personApi.getPeople(userId, 'individual').then(() => {
      chai.assert.fail('Should not have returned without error');
    }).catch((err) => {
      expect(err.message).to.equal('Example getPeople error');
    });
  });

  it('should successfully get all the saved persons for an org', (done) => {
    personApi.getPeople(orgId, 'organisation')
      .then((response) => {
        const responseObj = JSON.parse(response);
        expect(typeof responseObj).to.equal('object');
        done();
      });
  });

  it('should successfully update a saved persons information', (done) => {
    personApi.update(userId, personId, newPerson)
      .then((response) => {
        const responseObj = JSON.parse(response);
        expect(typeof responseObj).to.equal('object');
        done();
      });
  });

  it('should throw an error when updating a saved persons information', () => {
    nock.cleanAll();
    nock(BASE_URL)
      .put(`/user/${userId}/people/${personId}`, newPerson)
      .replyWithError({ message: 'Example update error', code: 404 });

    personApi.update(userId, personId, newPerson).then(() => {
      chai.assert.fail('Should not have returned without error');
    }).catch((err) => {
      expect(err.message).to.equal('Example update error');
    });
  });

  it('Should delete a saved person for an individual', (done) => {
    personApi.deletePerson(userId, personId)
      .then((response) => {
        const responseObj = JSON.parse(response);
        expect(typeof responseObj).to.equal('object');
        expect(responseObj).to.be.empty;
        done();
      });
  });

  it('should throw an error when deleting a saved person for an individual', () => {
    nock.cleanAll();
    nock(BASE_URL)
      .delete(`/user/${userId}/people/${personId}`)
      .replyWithError({ message: 'Example deletePerson error', code: 404 });

    personApi.deletePerson(userId, personId).then(() => {
      chai.assert.fail('Should not have returned without error');
    }).catch((err) => {
      expect(err.message).to.equal('Example deletePerson error');
    });
  });

  it('Should delete a saved person for an organisation', (done) => {
    personApi.deletePerson(orgId, personId)
      .then((response) => {
        const responseObj = JSON.parse(response);
        expect(typeof responseObj).to.equal('object');
        expect(responseObj).to.be.empty;
        done();
      });
  });
});
