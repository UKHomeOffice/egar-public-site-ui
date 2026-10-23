const logger = require('../utils/logger')(__filename);
const autocompleteUtil = require('../utils/autocomplete');
const travelPermissionCodes = require('../utils/travel_permission_codes.json');

function getResponseErrorMessage(err) {
  return {
    statusCode: err?.status ?? err?.statusCode,
    statusMessage: err?.statusText ?? err?.statusMessage,
    body: err?.body,
  };
}

function getDurationBeforeDeparture(departureDate, departureTime) {
  const departureDateTimeString = `${departureDate} ${departureTime}`;
  const departureDateTime = new Date(departureDateTimeString);
  const currentDateTimeISO = new Date().toISOString();
  const currentDateTime = new Date(currentDateTimeISO);
  return Math.round((departureDateTime - currentDateTime) / 1000 / 60);
}

class GarApi {
  constructor(client) {
    this.client = client;
  }

  async get(garId, isCbpId = false) {
    try {
      const gar = await this.client.get(`/gar/${garId}`, { query: { cbp_id: isCbpId } });
      gar.responsibleCountryLabel = autocompleteUtil.getCountryFromCode(gar.responsibleCountry);
      return gar;
    } catch (err) {
      if (err?.type !== 'http_error') {
        throw err;
      }
      logger.error('Failed to call GAR get API endpoint');
      const responseErrorMessage = getResponseErrorMessage(err);
      logger.error(`${garId} garApi.get request was not successful : ${JSON.stringify(responseErrorMessage)}`);
      return responseErrorMessage;
    }
  }

  async patch(garId, status, partial) {
    return this.client.patch(`/gar/${garId}`, { ...partial, status });
  }

  async getPeople(garId, pageNumber = null, amgResponseCode = null) {
    const priority = [
      'amg_checkin_response_code:0T',
      'amg_checkin_response_code:0B',
      'amg_checkin_response_code:0Z',
      'amg_checkin_response_code:0A',
    ];
    const pageObj = pageNumber ? { per_page: 10, page: pageNumber } : '';
    const options = amgResponseCode ? { amg_response_codes: amgResponseCode } : [''];

    try {
      const resp = await this.client.get(`/gar/${garId}/people`, {
        query: { priority, ...pageObj, ...options },
      });

      const noBoardPassengers = resp.items.filter(
        (garperson) => garperson.amgCheckinResponseCode === travelPermissionCodes['NO_BOARD']
      );
      const restOfPassengers = resp.items.filter(
        (garperson) => garperson.amgCheckinResponseCode !== travelPermissionCodes['NO_BOARD']
      );

      return { ...resp, items: [...noBoardPassengers, ...restOfPassengers] };
    } catch (err) {
      if (err?.type !== 'http_error') {
        throw err;
      }
      logger.error('Failed to call GAR get API endpoint');
      const responseErrorMessage = getResponseErrorMessage(err);
      logger.error(`${garId} garApi.getPeople request was not successful : ${JSON.stringify(responseErrorMessage)}`);
      return responseErrorMessage;
    }
  }

  async getSupportingDocs(garId) {
    try {
      const query = { page: 1, per_page: 10000 };
      const url = `/gar/${garId}/supportingdocs`;
      logger.debug(`Calling get supporting docs endpoint ${url}`);
      return await this.client.get(url, { query });
    } catch (err) {
      if (err?.type !== 'http_error') {
        throw err;
      }
      logger.error('Failed to call GAR get supporting documents API endpoint');
      const responseErrorMessage = getResponseErrorMessage(err);
      logger.error(
        `${garId} garApi.getSupportingDocs request was not successful : ${JSON.stringify(responseErrorMessage)}`
      );
      return responseErrorMessage;
    }
  }

  async getGarCheckinProgress(garId) {
    const endpoint = `/gar/${garId}/progress`;
    logger.debug(`Calling get GAR checkin progress endpoint ${endpoint}`);

    try {
      const { progress } = await this.client.get(endpoint);
      return progress;
    } catch (err) {
      if (err?.type !== 'http_error') {
        throw err;
      }
      const responseErrorMessage = getResponseErrorMessage(err);
      logger.error(`${garId} garApi.progress request was not successful : ${JSON.stringify(responseErrorMessage)}`);
      return responseErrorMessage;
    }
  }

  async getGars(userId, userType, pages, orgId = null) {
    const endpoint = userType === 'Individual' ? `/user/${userId}/gars` : `/user/${userId}/organisation/${orgId}/gars`;

    try {
      return await this.client.get(endpoint, {
        query: {
          status: pages.status,
          page: pages.page,
          per_page: pages.perPage,
        },
      });
    } catch (err) {
      if (err?.type !== 'http_error') {
        throw err;
      }
      const responseErrorMessage = getResponseErrorMessage(err);
      logger.error(`${userId} garApi.getGars request was not successful : ${JSON.stringify(responseErrorMessage)}`);
      return responseErrorMessage;
    }
  }

  async getGarsCount(userId, userType, orgId = null) {
    const endpoint =
      userType === 'Individual' ? `/user/${userId}/gars/count` : `/user/${userId}/organisation/${orgId}/gars/count`;
    return this.client.get(endpoint);
  }

  async submitGARForCheckin(garId) {
    return this.client.post(`/gar/${garId}/checkin`);
  }

  async submitGARForException(garId, passengerIds = []) {
    const onlyIndividuals = passengerIds.length > 0;
    return this.client.post(
      `/gar/${garId}/departure/exception`,
      { passengerIds },
      { query: { only_individuals: onlyIndividuals } }
    );
  }

  async updateGarPerson(garId, personDetails) {
    return this.client.patch(`/gar/${garId}/people`, { people: [personDetails] });
  }

  async deleteGarPeople(garId, garPersonId) {
    return this.client.delete(`/gar/${garId}/people`, { body: { garPeopleId: garPersonId } });
  }

  async deleteGarSupportingDoc(garId, garSupportingDocId) {
    return this.client.delete(`/gar/${garId}/supportingdocs/${garSupportingDocId}`);
  }

  async createGar(userId) {
    return this.client.post(`/user/${userId}/gar`);
  }
}

async function callConfiguredGarApi(method, args, { count = false, progress = false } = {}) {
  try {
    const result = await require('./dataAccessApi').garApi[method](...args);

    if (result && typeof result === 'object' && 'statusCode' in result && 'body' in result) {
      return count ? parseJsonResponse(result.body) : serializeResponse(result.body);
    }

    if (count) {
      return normalizeClientResponse(parseJsonResponse(result));
    }
    return progress ? JSON.stringify({ progress: result }) : serializeResponse(normalizeClientResponse(result));
  } catch (err) {
    if (err?.type === 'http_error') {
      return count ? parseJsonResponse(err.body) : serializeResponse(err.body);
    }
    throw err;
  }
}

function serializeResponse(response) {
  return typeof response === 'string' ? response : JSON.stringify(response);
}

function parseJsonResponse(response) {
  return typeof response === 'string' ? JSON.parse(response) : response;
}

function normalizeClientResponse(response) {
  if (!response || typeof response !== 'object' || Array.isArray(response) || !('ok' in response)) {
    return response;
  }

  const body = { ...response };
  delete body.ok;
  return body;
}

const legacyApi = {
  GarApi,
  getDurationBeforeDeparture,
};

[
  'patch',
  'get',
  'getPeople',
  'getGars',
  'getSupportingDocs',
  'deleteGarSupportingDoc',
  'submitGARForCheckin',
  'submitGARForException',
  'updateGarPerson',
  'deleteGarPeople',
  'getGarCheckinProgress',
  'getGarsCount',
].forEach((method) => {
  legacyApi[method] = (...args) =>
    callConfiguredGarApi(method, args, {
      count: method === 'getGarsCount',
      progress: method === 'getGarCheckinProgress',
    });
});

module.exports = legacyApi;
