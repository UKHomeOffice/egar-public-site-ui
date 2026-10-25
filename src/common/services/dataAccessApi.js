const settings = require('../config');
const { URL } = require('url');

const { API_BASE } = settings;
const { API_VERSION } = settings;
const BASE_URL = new URL(API_VERSION, API_BASE).href;
const { HttpClient } = require('./httpClient');
const garApi = require('./garApi');
const organisationApi = require('./organisationApi');
const personApi = require('./personApi');
const craftApi = require('./craftApi');
const resPersonApi = require('./resPersonApi');
const userManageApi = require('./userManageApi');
const createUserApi = require('./createUserApi');
const tokenApi = require('./tokenApi');
const verificationApi = require('./verificationApi');

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
