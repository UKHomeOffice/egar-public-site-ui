/* eslint-env mocha */
/* eslint-disable no-unused-expressions */

const { expect } = require('chai');
const chai = require('chai');
const nock = require('nock');

require('../../global.test');
const endpoints = require('../../../common/config/endpoints');
const garApi = require('../../../common/services/garApi');

const garId = 'c2d86db6-006c-4f5e-9e22-e039c8b1ddc7';
const userId = 'f058e37b-3fa2-4c05-a057-6c810d6c6bd6';
const personId = 'e5d94814-0d1e-4532-9f91-164f1ab77be3';
const orgId = 'c5c9fd4d-ae4d-4008-8358-2e74841e89d6';
const garSupportingDocId = '578c71f2-9601-4cb3-a569-3d70100781a6';

const garCraftPartial = {
  status: 'Draft',
  registration: 'UNIT01',
  craftType: 'EVA',
  craftBase: 'Tokyo',
};

const garPeoplePartial = {
  status: 'Draft',
  people: [
    {
      firstName: 'Shinobu',
      lastName: 'Oshino',
      gender: 'F',
      dateOfBirth: '1494-12-12',
      placeOfBirth: 'Berlin',
      nationality: 'German',
      peopleType: 'Crew',
      documentType: 'Passport',
      documentNumber: '1921231',
      documentExpiryDate: '2020-12-12',
      issuingState: 'TOK',
    },
  ],
};

const BASE_URL = endpoints.baseUrl();

describe('GarService', () => {
  beforeEach(() => {
    nock(BASE_URL)
      .patch(`/gar/${garId}`, garCraftPartial)
      .reply(200, {
        status: { name: 'Draft' },
      });

    nock(BASE_URL)
      .get(`/gar/${garId}`)
      .reply(200, {
        status: { name: 'Draft' },
      });

    nock(BASE_URL)
      .get(`/gar/${garId}/people?page=1&per_page=10000`)
      .reply(200, {
        status: { name: 'Draft' },
        items: [],
      });

    nock(BASE_URL)
      .patch(`/gar/${garId}`, garPeoplePartial)
      .reply(200, {
        status: { name: 'Draft' },
        people: [],
      });

    nock(BASE_URL)
      .get(`/user/${userId}/gars?page=1&per_page=10000`)
      .reply(200, {
        items: [{}, {}],
      });

    nock(BASE_URL)
      .get(`/user/${userId}/organisation/${orgId}/gars?page=1&per_page=10000`)
      .reply(200, {
        items: [{}],
      });

    nock(BASE_URL)
      .get(`/gar/${garId}/supportingdocs?page=1&per_page=10000`)
      .reply(200, {
        status: 'Draft',
        items: [],
      });

    nock(BASE_URL)
      .patch(`/gar/${garId}/people`, { people: [garPeoplePartial.people[0]] })
      .reply(200, {
        status: 'Draft',
      });

    nock(BASE_URL)
      .delete(`/gar/${garId}/supportingdocs/${garSupportingDocId}`)
      .reply(200, {});

    nock(BASE_URL)
      .delete(`/gar/${garId}/people`)
      .reply(200, {});
  });

  it('Should update the GARs craft details', (done) => {
    garApi.patch(garId, 'Draft', garCraftPartial)
      .then((apiResponse) => {
        const parsedResponse = JSON.parse(apiResponse);
        expect(typeof parsedResponse).to.equal('object');
        expect(parsedResponse).to.have.keys(['status']);
        expect(parsedResponse.status).to.have.keys(['name']);
        done();
      });
  });

  it('Should get the GAR details', (done) => {
    garApi.get(garId)
      .then((apiResponse) => {
        const parsedResponse = JSON.parse(apiResponse);
        expect(typeof parsedResponse).to.equal('object');
        expect(parsedResponse).to.have.keys(['status']);
        expect(parsedResponse.status).to.have.keys(['name']);
        done();
      });
  });

  it('Should update the GARs manifest', (done) => {
    garApi.patch(garId, 'Draft', garPeoplePartial)
      .then((apiResponse) => {
        const parsedResponse = JSON.parse(apiResponse);
        expect(typeof parsedResponse).to.equal('object');
        expect(parsedResponse).to.have.keys(['status', 'people']);
        done();
      });
  });

  it('Should fetch the people saved to a GAR', (done) => {
    garApi.getPeople(garId)
      .then((apiResponse) => {
        const parsedResponse = JSON.parse(apiResponse);
        expect(typeof parsedResponse).to.equal('object');
        expect(parsedResponse).to.have.keys(['status', 'items']);
        done();
      });
  });

  it('Should return all GARs belonging to an individual', (done) => {
    garApi.getGars(userId, 'Individual')
      .then((apiResponse) => {
        const parsedResponse = JSON.parse(apiResponse);
        expect(typeof parsedResponse).to.equal('object');
        expect(parsedResponse).to.have.keys(['items']);
        expect(parsedResponse.items).to.have.length(2);
        done();
      });
  });

  it('Should return all GARs belonging to an organisation', (done) => {
    garApi.getGars(userId, 'Admin', orgId)
      .then((apiResponse) => {
        const parsedResponse = JSON.parse(apiResponse);
        expect(typeof parsedResponse).to.equal('object');
        expect(parsedResponse).to.have.keys(['items']);
        expect(parsedResponse.items).to.have.length(1);
        done();
      });
  });

  it('Should fetch the supportingdocuments saved to a GAR', (done) => {
    garApi.getSupportingDocs(garId)
      .then((apiResponse) => {
        const parsedResponse = JSON.parse(apiResponse);
        expect(typeof parsedResponse).to.equal('object');
        expect(parsedResponse).to.have.keys(['status', 'items']);
        done();
      });
  });

  it('Should update the details of a person on a GARs manifest', (done) => {
    garApi.updateGarPerson(garId, garPeoplePartial.people[0])
      .then((apiResponse) => {
        const parsedResponse = JSON.parse(apiResponse);
        expect(typeof parsedResponse).to.equal('object');
        expect(parsedResponse).to.have.keys(['status']);
        done();
      });
  });

  it('should delete the supporting document from a GAR', () => {
    garApi.deleteGarSupportingDoc(garId, garSupportingDocId)
      .then((apiResponse) => {
        const parsedResponse = JSON.parse(apiResponse);
        expect(typeof parsedResponse).to.equal('object');
        expect(parsedResponse).to.be.empty;
      });
  });

  it('Should delete the person from a GARs manifest', () => {
    garApi.deleteGarPerson(garId, personId)
      .then((apiResponse) => {
        const parsedResponse = JSON.parse(apiResponse);
        expect(typeof parsedResponse).to.equal('object');
        expect(parsedResponse).to.be.empty;
      });
  });

  it('should throw an error for patch', () => {
    nock.cleanAll();
    nock(BASE_URL)
      .patch(`/gar/${garId}`, garCraftPartial)
      .replyWithError({ message: 'Example patch error', code: 404 });

    garApi.patch(garId, 'Draft', garCraftPartial).then(() => {
      chai.assert.fail('Should not have returned without error');
    }).catch((err) => {
      expect(err.message).to.equal('Example patch error');
    });
  });

  it('should throw an error for get', () => {
    nock.cleanAll();
    nock(BASE_URL)
      .get(`/gar/${garId}`)
      .replyWithError({ message: 'Example get error', code: 404 });

    garApi.get(garId).then(() => {
      chai.assert.fail('Should not have returned without error');
    }).catch((err) => {
      expect(err.message).to.equal('Example get error');
    });
  });

  it('should throw an error for getPeople', () => {
    nock.cleanAll();
    nock(BASE_URL)
      .get(`/gar/${garId}/people?page=1&per_page=10000`)
      .replyWithError({ message: 'Example getPeople error', code: 404 });

    garApi.getPeople(garId).then(() => {
      chai.assert.fail('Should not have returned without error');
    }).catch((err) => {
      expect(err.message).to.equal('Example getPeople error');
    });
  });

  it('should throw an error for getGars', () => {
    nock.cleanAll();
    nock(BASE_URL)
      .get(`/user/${userId}/gars?page=1&per_page=10000`)
      .replyWithError({ message: 'Example getGars error', code: 404 });

    garApi.getGars(userId, 'Individual').then(() => {
      chai.assert.fail('Should not have returned without error');
    }).catch((err) => {
      expect(err.message).to.equal('Example getGars error');
    });
  });

  it('should throw an error for getSupportingDocs', () => {
    nock.cleanAll();
    nock(BASE_URL)
      .get(`/gar/${garId}/supportingdocs?page=1&per_page=10000`)
      .replyWithError({ message: 'Example getSupportingDocs error', code: 404 });

    garApi.getSupportingDocs(garId).then(() => {
      chai.assert.fail('Should not have returned without error');
    }).catch((err) => {
      expect(err.message).to.equal('Example getSupportingDocs error');
    });
  });

  it('should throw an error for deleteGarSupportingDoc', () => {
    nock.cleanAll();
    nock(BASE_URL)
      .delete(`/gar/${garId}/supportingdocs/${garSupportingDocId}`)
      .replyWithError({ message: 'Example deleteGarSupportingDoc error', code: 404 });

    garApi.deleteGarSupportingDoc(garId, garSupportingDocId).then(() => {
      chai.assert.fail('Should not have returned without error');
    }).catch((err) => {
      expect(err.message).to.equal('Example deleteGarSupportingDoc error');
    });
  });

  it('should throw an error for updateGarPerson', () => {
    nock.cleanAll();
    nock(BASE_URL)
      .patch(`/gar/${garId}/people`, { people: [garPeoplePartial.people[0]] })
      .replyWithError({ message: 'Example updateGarPerson error', code: 404 });

    garApi.updateGarPerson(garId, garPeoplePartial.people[0]).then(() => {
      chai.assert.fail('Should not have returned without error');
    }).catch((err) => {
      expect(err.message).to.equal('Example updateGarPerson error');
    });
  });

  it('should throw an error for deleteGarPerson', () => {
    nock.cleanAll();
    nock(BASE_URL)
      .delete(`/gar/${garId}/people`)
      .replyWithError({ message: 'Example deleteGarPerson error', code: 404 });

    garApi.deleteGarPerson(garId, personId).then(() => {
      chai.assert.fail('Should not have returned without error');
    }).catch((err) => {
      expect(err.message).to.equal('Example deleteGarPerson error');
    });
  });
});
