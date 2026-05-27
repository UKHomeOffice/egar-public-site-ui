const settings = require('../config');

const { API_BASE } = settings;
const { API_VERSION } = settings;
const BASE_URL = new URL(API_VERSION, API_BASE).href;
const ApiClient = require('./httpClient');
const { GarApi } = require('./garApi');

const httpClient = new ApiClient({ baseURL: BASE_URL });

module.exports = {
  garApi: new GarApi(httpClient),
};
