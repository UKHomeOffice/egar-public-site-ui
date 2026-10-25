const settings = require('../config');
const { URL } = require('url');

const { API_BASE } = settings;
const { API_VERSION } = settings;
const BASE_URL = new URL(API_VERSION, API_BASE).href;
const { HttpClient } = require('./httpClient');
const garApi = require('./data-access/garApi');
const organisationApi = require('./data-access/organisationApi');
const personApi = require('./data-access/personApi');
const craftApi = require('./data-access/craftApi');
const resPersonApi = require('./data-access/resPersonApi');
const userManageApi = require('./data-access/userManageApi');
const createUserApi = require('./data-access/createUserApi');
const tokenApi = require('./data-access/tokenApi');
const verificationApi = require('./data-access/verificationApi');

const client = new HttpClient({ baseUrl: BASE_URL });

module.exports = {
  garApi: new garApi.GarApi(client),
  organisationApi: new organisationApi.OrganisationApi(client),
  personApi: new personApi.PersonApi(client),
  craftApi: new craftApi.CraftApi(client),
  resPersonApi: new resPersonApi.ResPersonApi(client),
  userManageApi: new userManageApi.UserManageApi(client),
  createUserApi: new createUserApi.CreateUserApi(client),
  tokenApi: new tokenApi.TokenApi(client),
  verificationApi: new verificationApi.VerificationApi(client),
};
