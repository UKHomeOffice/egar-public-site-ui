const settings = require('../config');

const { API_BASE } = settings;
const { API_VERSION } = settings;
const BASE_URL = `${API_BASE}${API_VERSION}`;
const ApiClient = require('./httpClient');
const { GarApi } = require('./garApi');

const httpClient = new ApiClient({ baseUrl: BASE_URL });

module.exports = {
  garApi: new GarApi(httpClient),
};
