const settings = require('../config');
const { URL } = require('url');

const { API_BASE } = settings;
const { API_VERSION } = settings;
const BASE_URL = new URL(API_VERSION, API_BASE).href;
const { HttpClient } = require('./httpClient');
const garApi = require('./garApi');
const organisationApi = require('./organisationApi');

const client = new HttpClient({ baseUrl: BASE_URL });

module.exports = {
  garApi: new garApi.GarApi(client),
  organisationApi: new organisationApi.OrganisationApi(client),
};
