const { expect } = require('chai');
const sinon = require('sinon');

require('../../global.test');
const garApiService = require('../../../common/services/garApi');
const dataAccessApi = require('../../../common/services/dataAccessApi');

const garId = 'c2d86db6-006c-4f5e-9e22-e039c8b1ddc7';
const userId = 'f058e37b-3fa2-4c05-a057-6c810d6c6bd6';
const personId = 'e5d94814-0d1e-4532-9f91-164f1ab77be3';
const orgId = 'c5c9fd4d-ae4d-4008-8358-2e74841e89d6';
const supportingDocId = '578c71f2-9601-4cb3-a569-3d70100781a6';
const person = { firstName: 'Ada', lastName: 'Lovelace' };

describe('GarApi', () => {
  const pages = { page: 2, perPage: 10, status: 'Submitted' };

  afterEach(() => sinon.restore());

  it('gets GAR details through the injected HTTP client and enriches the country label', async () => {
    const gar = { garId, responsibleCountry: 'GBR' };
    const client = {
      get: async (path, options) => {
        expect(path).to.equal(`/gar/${garId}`);
        expect(options).to.deep.equal({ query: { cbp_id: false } });
        return { ...gar };
      },
    };

    const result = await new garApiService.GarApi(client).get(garId);

    expect(result).to.include(gar);
    expect(result.responsibleCountryLabel).to.be.a('string');
  });

  it('gets GAR people with pagination and response-code filters and preserves NO_BOARD ordering', async () => {
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

    const result = await new garApiService.GarApi(client).getPeople(garId, 2, '0T');

    expect(result.items.map(({ id }) => id)).to.deep.equal(['no-board', 'allowed', 'pending']);
  });

  it('gets supporting documents with the existing pagination query', async () => {
    const response = { items: [{ id: 'document-1' }] };
    const client = {
      get: async (path, options) => {
        expect(path).to.equal(`/gar/${garId}/supportingdocs`);
        expect(options).to.deep.equal({ query: { page: 1, per_page: 10000 } });
        return response;
      },
    };

    expect(await new garApiService.GarApi(client).getSupportingDocs(garId)).to.equal(response);
  });

  it('extracts check-in progress through the injected HTTP client', async () => {
    const progress = { completed: 2, total: 4 };
    const client = {
      get: async (path) => {
        expect(path).to.equal(`/gar/${garId}/progress`);
        return { progress };
      },
    };

    expect(await new garApiService.GarApi(client).getGarCheckinProgress(garId)).to.equal(progress);
  });

  it('gets GARs for individuals and organisations with pagination', async () => {
    const response = { items: [{ id: 'GAR-1' }] };
    const client = {
      get: async (path, options) => {
        expect(path).to.equal(`/user/${userId}/gars`);
        expect(options).to.deep.equal({ query: { status: 'Submitted', page: 2, per_page: 10 } });
        return response;
      },
    };

    expect(await new garApiService.GarApi(client).getGars(userId, 'Individual', pages)).to.equal(response);

    const organisationClient = {
      get: async (path) => {
        expect(path).to.equal(`/user/${userId}/organisation/${orgId}/gars`);
        return response;
      },
    };
    expect(await new garApiService.GarApi(organisationClient).getGars(userId, 'Admin', pages, orgId)).to.equal(
      response
    );
  });

  it('gets GAR counts for individuals and organisations', async () => {
    const client = {
      get: async (path) => {
        expect(path).to.equal(`/user/${userId}/gars/count`);
        return { count: 1 };
      },
    };
    const api = new garApiService.GarApi(client);

    expect(await api.getGarsCount(userId, 'Individual')).to.deep.equal({ count: 1 });
    const organisationClient = {
      get: async (path) => {
        expect(path).to.equal(`/user/${userId}/organisation/${orgId}/gars/count`);
        return { count: 2 };
      },
    };
    expect(await new garApiService.GarApi(organisationClient).getGarsCount(userId, 'Admin', orgId)).to.deep.equal({
      count: 2,
    });
  });

  it('patches GAR updates without mutating the caller payload', async () => {
    const update = { registration: 'UNIT01' };
    const client = {
      patch: async (path, body) => {
        expect(path).to.equal(`/gar/${garId}`);
        expect(body).to.deep.equal({ registration: 'UNIT01', status: 'Draft' });
        return { status: { name: 'Draft' } };
      },
    };

    await new garApiService.GarApi(client).patch(garId, 'Draft', update);
    expect(update).to.deep.equal({ registration: 'UNIT01' });
  });

  it('submits check-in and departure exception requests', async () => {
    const client = {
      post: async (path, body, options) => {
        if (path.endsWith('/checkin')) {
          expect(path).to.equal(`/gar/${garId}/checkin`);
          expect(body).to.be.undefined;
          expect(options).to.be.undefined;
        } else {
          expect(path).to.equal(`/gar/${garId}/departure/exception`);
          expect(body).to.deep.equal({ passengerIds: [personId] });
          expect(options).to.deep.equal({ query: { only_individuals: true } });
        }
        return {};
      },
    };
    const api = new garApiService.GarApi(client);

    await api.submitGARForCheckin(garId);
    await api.submitGARForException(garId, [personId]);
  });

  it('submits departure exceptions for the whole GAR when no passenger IDs are provided', async () => {
    const client = {
      post: async (path, body, options) => {
        expect(path).to.equal(`/gar/${garId}/departure/exception`);
        expect(body).to.deep.equal({ passengerIds: [] });
        expect(options).to.deep.equal({ query: { only_individuals: false } });
        return {};
      },
    };

    await new garApiService.GarApi(client).submitGARForException(garId);
  });

  it('updates people and deletes people and supporting documents through the injected client', async () => {
    const calls = [];
    const client = {
      patch: async (...args) => calls.push(['patch', ...args]),
      delete: async (...args) => calls.push(['delete', ...args]),
    };
    const api = new garApiService.GarApi(client);

    await api.updateGarPerson(garId, person);
    await api.deleteGarPeople(garId, personId);
    await api.deleteGarSupportingDoc(garId, supportingDocId);

    expect(calls).to.deep.equal([
      ['patch', `/gar/${garId}/people`, { people: [person] }],
      ['delete', `/gar/${garId}/people`, { body: { garPeopleId: personId } }],
      ['delete', `/gar/${garId}/supportingdocs/${supportingDocId}`],
    ]);
  });

  it('creates GARs through the injected client', async () => {
    const client = {
      post: async (path, body) => {
        expect(path).to.equal(`/user/${userId}/gar`);
        expect(body).to.be.undefined;
        return { garId };
      },
    };

    expect(await new garApiService.GarApi(client).createGar(userId)).to.deep.equal({ garId });
  });

  it('preserves the existing GAR read failure shape for Fetch HTTP errors', async () => {
    const client = {
      get: async () => {
        const error = new Error('Unavailable');
        Object.assign(error, {
          type: 'http_error',
          status: 503,
          statusText: 'Service Unavailable',
          body: { message: 'Maintenance' },
        });
        throw error;
      },
    };

    expect(await new garApiService.GarApi(client).get(garId)).to.deep.equal({
      statusCode: 503,
      statusMessage: 'Service Unavailable',
      body: { message: 'Maintenance' },
    });
  });

  it('propagates network errors instead of returning a success-shaped fallback', async () => {
    const networkError = new Error('offline');
    const client = { get: async () => Promise.reject(networkError) };

    try {
      await new garApiService.GarApi(client).get(garId);
      expect.fail('Expected network error to be propagated');
    } catch (err) {
      expect(err).to.equal(networkError);
    }
  });

  it('keeps legacy service calls as a string boundary over the configured GarApi', async () => {
    const getStub = sinon.stub(dataAccessApi.garApi, 'get').resolves({ ok: true, garId });

    expect(await garApiService.get(garId)).to.equal(JSON.stringify({ garId }));
    expect(getStub.calledOnceWithExactly(garId)).to.equal(true);
  });

  it('preserves the legacy JSON object and body-string boundaries for counts and HTTP errors', async () => {
    const countStub = sinon.stub(dataAccessApi.garApi, 'getGarsCount').resolves('{"ok":true,"count":3}');
    expect(await garApiService.getGarsCount(userId, 'Individual')).to.deep.equal({ count: 3 });
    expect(countStub.calledOnceWithExactly(userId, 'Individual')).to.equal(true);

    const error = new Error('Request failed');
    Object.assign(error, { type: 'http_error', body: { message: 'GAR update failed' } });
    const patchStub = sinon.stub(dataAccessApi.garApi, 'patch').rejects(error);
    expect(await garApiService.patch(garId, 'Draft', {})).to.equal(JSON.stringify(error.body));
    expect(patchStub.calledOnceWithExactly(garId, 'Draft', {})).to.equal(true);
  });
});
