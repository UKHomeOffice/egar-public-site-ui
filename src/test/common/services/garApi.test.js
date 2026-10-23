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
  const pages = { page: 1, per_page: undefined, status: 'Draft' };
  beforeEach(() => {
    nock(BASE_URL)
      .patch(`/gar/${garId}`, garCraftPartial)
      .reply(200, {
        status: { name: 'Draft' },
      });

    nock(BASE_URL)
      .get(`/gar/${garId}?cbp_id=false`)
      .reply(200, {
        status: { name: 'Draft' },
      });

    nock(BASE_URL)
      .get(
        `/gar/${garId}/people?page=1&per_page=10&priority=amg_checkin_response_code%3A0T%2Camg_checkin_response_code%3A0B%2Camg_checkin_response_code%3A0Z%2Camg_checkin_response_code%3A0A&amg_response_codes=0T`
      )
      .reply(200, {
        _meta: {
          page: 1,
          perPage: 10,
          totalPages: 1,
          totalItems: 4,
        },
        _links: {
          currentPage: '/v0.2.0/gar/f8ff8083-26cf-48d2-82c1-64eec0fecbb3/people?page=1&per_page=100',
          next: null,
          prev: null,
        },
        garId: 'f8ff8083-26cf-48d2-82c1-64eec0fecbb3',
        status: {
          name: 'Draft',
        },
        items: [],
      });

    nock(BASE_URL)
      .patch(`/gar/${garId}`, garPeoplePartial)
      .reply(200, {
        status: { name: 'Draft' },
        people: [],
      });

    nock(BASE_URL)
      .get(`/user/${userId}/gars?status=Draft&page=1&per_page=undefined`)
      .reply(200, {
        items: [{}, {}],
      });

    nock(BASE_URL)
      .get(`/user/${userId}/organisation/${orgId}/gars?status=Draft&page=1&per_page=undefined`)
      .reply(200, {
        items: [{}],
      });

    nock(BASE_URL).get(`/gar/${garId}/supportingdocs?page=1&per_page=10000`).reply(200, {
      status: 'Draft',
      items: [],
    });

    nock(BASE_URL)
      .patch(`/gar/${garId}/people`, { people: [garPeoplePartial.people[0]] })
      .reply(200, {
        status: 'Draft',
      });

    nock(BASE_URL).delete(`/gar/${garId}/supportingdocs/${garSupportingDocId}`).reply(200, {});

    nock(BASE_URL).delete(`/gar/${garId}/people`).reply(200, {});
  });

  it('Should update the GARs craft details', (done) => {
    garApi.patch(garId, 'Draft', garCraftPartial).then((apiResponse) => {
      const parsedResponse = JSON.parse(apiResponse);
      expect(typeof parsedResponse).to.equal('object');
      expect(parsedResponse).to.have.keys(['status']);
      expect(parsedResponse.status).to.have.keys(['name']);
      done();
    });
  });

  it('Should get the GAR details', (done) => {
    garApi.get(garId).then((apiResponse) => {
      const parsedResponse = JSON.parse(apiResponse);
      expect(typeof parsedResponse).to.equal('object');
      expect(parsedResponse).to.have.keys(['status']);
      expect(parsedResponse.status).to.have.keys(['name']);
      done();
    });
  });

  it('Should update the GARs manifest', (done) => {
    garApi.patch(garId, 'Draft', garPeoplePartial).then((apiResponse) => {
      const parsedResponse = JSON.parse(apiResponse);
      expect(typeof parsedResponse).to.equal('object');
      expect(parsedResponse).to.have.keys(['status', 'people']);
      done();
    });
  });

  it('Should fetch the people saved to a GAR', (done) => {
    garApi.getPeople(garId, 1, '0T').then((apiResponse) => {
      const parsedResponse = JSON.parse(apiResponse);
      expect(typeof parsedResponse).to.equal('object');
      expect(parsedResponse).to.include.all.keys(['status', 'items']);
      done();
    });
  });

  it('Should return all GARs belonging to an individual', (done) => {
    garApi.getGars(userId, 'Individual', pages).then((apiResponse) => {
      const parsedResponse = JSON.parse(apiResponse);
      expect(typeof parsedResponse).to.equal('object');
      expect(parsedResponse).to.have.keys(['items']);
      expect(parsedResponse.items).to.have.length(2);
      done();
    });
  });

  it('Should return all GARs belonging to an organisation', (done) => {
    garApi.getGars(userId, 'Admin', pages, orgId).then((apiResponse) => {
      const parsedResponse = JSON.parse(apiResponse);
      expect(typeof parsedResponse).to.equal('object');
      expect(parsedResponse).to.have.keys(['items']);
      expect(parsedResponse.items).to.have.length(1);
      done();
    });
  });

  it('Should fetch the supportingdocuments saved to a GAR', (done) => {
    garApi.getSupportingDocs(garId).then((apiResponse) => {
      const parsedResponse = JSON.parse(apiResponse);
      expect(typeof parsedResponse).to.equal('object');
      expect(parsedResponse).to.have.keys(['status', 'items']);
      done();
    });
  });

  it('Should update the details of a person on a GARs manifest', (done) => {
    garApi.updateGarPerson(garId, garPeoplePartial.people[0]).then((apiResponse) => {
      const parsedResponse = JSON.parse(apiResponse);
      expect(typeof parsedResponse).to.equal('object');
      expect(parsedResponse).to.have.keys(['status']);
      done();
    });
  });

  it('should delete the supporting document from a GAR', () => {
    garApi.deleteGarSupportingDoc(garId, garSupportingDocId).then((apiResponse) => {
      const parsedResponse = JSON.parse(apiResponse);
      expect(typeof parsedResponse).to.equal('object');
      expect(parsedResponse).to.be.empty;
    });
  });

  it('Should delete the person from a GARs manifest', () => {
    garApi.deleteGarPeople(garId, personId).then((apiResponse) => {
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

    garApi
      .patch(garId, 'Draft', garCraftPartial)
      .then(() => {
        chai.assert.fail('Should not have returned without error');
      })
      .catch((err) => {
        expect(err.message).to.equal('Example patch error');
      });
  });

  it('should throw an error for get', () => {
    nock.cleanAll();
    nock(BASE_URL).get(`/gar/${garId}?cbp_id=false`).replyWithError({ message: 'Example get error', code: 404 });

    garApi
      .get(garId)
      .then(() => {
        chai.assert.fail('Should not have returned without error');
      })
      .catch((err) => {
        expect(err.message).to.equal('Example get error');
      });
  });

  it('should throw an error for getPeople', () => {
    nock.cleanAll();
    nock(BASE_URL)
      .get(
        `/gar/${garId}/people?page=1&per_page=10&priority=amg_checkin_response_code%3A0T%2Camg_checkin_response_code%3A0B%2Camg_checkin_response_code%3A0Z%2Camg_checkin_response_code%3A0A&amg_response_codes=0T`
      )
      .replyWithError({ message: 'Example getPeople error', code: 404 });

    garApi
      .getPeople(garId, 1, '0T')
      .then(() => {
        chai.assert.fail('Should not have returned without error');
      })
      .catch((err) => {
        expect(err.message).to.equal('Example getPeople error');
      });
  });

  it('should throw an error for getGars', () => {
    nock.cleanAll();
    nock(BASE_URL)
      .get(`/user/${userId}/gars?status=Draft&page=1&per_page=undefined`)
      .replyWithError({ message: 'Example getGars error', code: 404 });
    garApi
      .getGars(userId, 'Individual', pages)
      .then(() => {
        chai.assert.fail('Should not have returned without error');
      })
      .catch((err) => {
        expect(err.message).to.equal('Example getGars error');
      });
  });

  it('should throw an error for getSupportingDocs', () => {
    nock.cleanAll();
    nock(BASE_URL)
      .get(`/gar/${garId}/supportingdocs?page=1&per_page=10000`)
      .replyWithError({ message: 'Example getSupportingDocs error', code: 404 });

    garApi
      .getSupportingDocs(garId)
      .then(() => {
        chai.assert.fail('Should not have returned without error');
      })
      .catch((err) => {
        expect(err.message).to.equal('Example getSupportingDocs error');
      });
  });

  it('should throw an error for deleteGarSupportingDoc', () => {
    nock.cleanAll();
    nock(BASE_URL)
      .delete(`/gar/${garId}/supportingdocs/${garSupportingDocId}`)
      .replyWithError({ message: 'Example deleteGarSupportingDoc error', code: 404 });

    garApi
      .deleteGarSupportingDoc(garId, garSupportingDocId)
      .then(() => {
        chai.assert.fail('Should not have returned without error');
      })
      .catch((err) => {
        expect(err.message).to.equal('Example deleteGarSupportingDoc error');
      });
  });

  it('should throw an error for updateGarPerson', () => {
    nock.cleanAll();
    nock(BASE_URL)
      .patch(`/gar/${garId}/people`, { people: [garPeoplePartial.people[0]] })
      .replyWithError({ message: 'Example updateGarPerson error', code: 404 });

    garApi
      .updateGarPerson(garId, garPeoplePartial.people[0])
      .then(() => {
        chai.assert.fail('Should not have returned without error');
      })
      .catch((err) => {
        expect(err.message).to.equal('Example updateGarPerson error');
      });
  });

  it('should throw an error for deleteGarPeople', () => {
    nock.cleanAll();
    nock(BASE_URL)
      .delete(`/gar/${garId}/people`)
      .replyWithError({ message: 'Example deleteGarPeople error', code: 404 });

    garApi
      .deleteGarPeople(garId, personId)
      .then(() => {
        chai.assert.fail('Should not have returned without error');
      })
      .catch((err) => {
        expect(err.message).to.equal('Example deleteGarPeople error');
      });
  });
});

describe('GarApi', () => {
  const pages = { page: 2, perPage: 10, status: 'Submitted' };

  it('gets GAR details through the injected HTTP client', async () => {
    const gar = { garId, responsibleCountry: 'GBR' };
    const client = {
      get: async (path, options) => {
        expect(path).to.equal(`/gar/${garId}`);
        expect(options).to.deep.equal({ query: { cbp_id: false } });
        return { ok: true, ...gar };
      },
    };
    const api = new garApi.GarApi(client);

    const result = await api.get(garId);

    expect(result).to.include(gar);
    expect(result.responsibleCountryLabel).to.be.a('string');
  });

  it('gets GAR people through the injected HTTP client and preserves no-board ordering', async () => {
    const noBoardCode = require('../../../common/utils/travel_permission_codes.json')['NO_BOARD'];
    const response = {
      items: [
        { id: 'allowed', amgCheckinResponseCode: '0A' },
        { id: 'no-board', amgCheckinResponseCode: noBoardCode },
        { id: 'pending', amgCheckinResponseCode: '0T' },
      ],
    };
    const client = {
      get: async (path, options) => {
        expect(path).to.equal(`/gar/${garId}/people`);
        expect(options.query).to.deep.equal({
          priority: [
            'amg_checkin_response_code:0T',
            'amg_checkin_response_code:0B',
            'amg_checkin_response_code:0Z',
            'amg_checkin_response_code:0A',
          ],
          per_page: 10,
          page: 2,
          amg_response_codes: '0T',
        });
        return response;
      },
    };
    const api = new garApi.GarApi(client);

    const result = await api.getPeople(garId, 2, '0T');

    expect(result.items.map(({ id }) => id)).to.deep.equal(['no-board', 'allowed', 'pending']);
  });

  it('gets supporting documents through the injected HTTP client', async () => {
    const response = { items: [{ id: 'document-1' }] };
    const client = {
      get: async (path, options) => {
        expect(path).to.equal(`/gar/${garId}/supportingdocs`);
        expect(options).to.deep.equal({ query: { page: 1, per_page: 10000 } });
        return response;
      },
    };
    const api = new garApi.GarApi(client);

    expect(await api.getSupportingDocs(garId)).to.equal(response);
  });

  it('gets check-in progress through the injected HTTP client', async () => {
    const progress = { completed: 2, total: 4 };
    const client = {
      get: async (path) => {
        expect(path).to.equal(`/gar/${garId}/progress`);
        return { progress };
      },
    };
    const api = new garApi.GarApi(client);

    expect(await api.getGarCheckinProgress(garId)).to.equal(progress);
  });

  it('should get GARs for an individual using the configured HTTP client', async () => {
    const response = { items: [{ id: 'GAR-1' }] };
    const client = {
      get: async (path, options) => {
        expect(path).to.equal(`/user/${userId}/gars`);
        expect(options).to.deep.equal({
          query: { status: 'Submitted', page: 2, per_page: 10 },
        });
        return response;
      },
    };

    const api = new garApi.GarApi(client);

    expect(await api.getGars(userId, 'Individual', pages)).to.equal(response);
  });

  it('should get GARs for an organisation using the configured HTTP client', async () => {
    const client = {
      get: async (path) => {
        expect(path).to.equal(`/user/${userId}/organisation/${orgId}/gars`);
        return { items: [] };
      },
    };

    const api = new garApi.GarApi(client);

    expect(await api.getGars(userId, 'Admin', pages, orgId)).to.deep.equal({ items: [] });
  });

  it('preserves the existing GAR read failure shape for Fetch HTTP errors', async () => {
    const client = {
      get: async () => {
        const error = new Error('Unavailable');
        Object.assign(error, {
          status: 503,
          statusText: 'Service Unavailable',
          body: { message: 'Maintenance' },
        });
        throw error;
      },
    };
    const api = new garApi.GarApi(client);

    expect(await api.get(garId)).to.deep.equal({
      statusCode: 503,
      statusMessage: 'Service Unavailable',
      body: { message: 'Maintenance' },
    });
  });
});
