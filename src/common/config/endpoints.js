const { URL } = require('url');
const settings = require('./index');
const logger = require('../utils/logger')(__filename);

const { API_BASE } = settings;
const { API_VERSION } = settings;
const BASE_URL = new URL(API_VERSION, API_BASE).href;

const endpoints = {
  baseUrl() {
    return BASE_URL;
  },
  register() {
    const endpoint = new URL(`${API_VERSION}/user/register`, BASE_URL).href;
    logger.debug(`Calling register endpoint ${endpoint}`);
    return endpoint;
  },
  getUserData(email) {
    const endpoint = new URL(`${API_VERSION}/user/${email}`, BASE_URL).href;
    logger.debug(`Calling getUserData endpoint ${endpoint}`);
    return endpoint;
  },
  updateUserData(userId) {
    const endpoint = new URL(`${API_VERSION}/user/${userId}`, BASE_URL).href;
    logger.debug(`Calling updateUserData endpoint ${endpoint}`);
    return endpoint;
  },
  deleteUser(userId, email) {
    const endpoint = new URL(`${API_VERSION}/user/${email || userId}`, BASE_URL).href;
    logger.debug(`Calling deleteUserData endpoint ${endpoint}`);
    return endpoint;
  },
  setToken() {
    const endpoint = new URL(`${API_VERSION}/user/settoken`, BASE_URL).href;
    logger.debug(`Calling settoken endpoint ${endpoint}`);
    return endpoint;
  },
  verifyUser() {
    const endpoint = new URL(`${API_VERSION}/user/verify`, BASE_URL).href;
    logger.debug(`Calling verify endpoint ${endpoint}`);
    return endpoint;
  },
  registerOrg() {
    const endpoint = new URL(`${API_VERSION}/organisations`, BASE_URL).href;
    logger.debug(`Calling create org endpoint ${endpoint}`);
    return endpoint;
  },
  updateOrg(orgId) {
    const endpoint = new URL(`${API_VERSION}/organisations/${orgId}`, BASE_URL).href;
    logger.debug(`Calling update org endpoint ${endpoint}`);
    return endpoint;
  },
  getOrgDetails(orgId) {
    const endpoint = new URL(`${API_VERSION}/organisations/${orgId}`, BASE_URL).href;
    logger.debug(`Calling get org endpoint ${endpoint}`);
    return endpoint;
  },
  getOrgUsers(orgId) {
    const endpoint = new URL(`${API_VERSION}/organisations/${orgId}/users`, BASE_URL).href;
    logger.debug(`Calling get org users endpoint ${endpoint}`);
    return endpoint;
  },
  createCraft(userId) {
    const endpoint = new URL(`${API_VERSION}/user/${userId}/crafts`, BASE_URL).href;
    logger.debug(`Calling create craft endpoint ${endpoint}`);
    return endpoint;
  },
  getCraftData(userId, craftId) {
    const endpoint = new URL(`${API_VERSION}/user/${userId}/crafts/${craftId}`, BASE_URL).href;
    logger.debug(`Calling get craft details endpoint ${endpoint}`);
    return endpoint;
  },
  getCrafts(userId) {
    const endpoint = new URL(`${API_VERSION}/user/${userId}/crafts`, BASE_URL).href;
    logger.debug(`Calling get crafts endpoint ${endpoint}`);
    return endpoint;
  },
  getOrgCrafts(orgId) {
    const endpoint = new URL(`${API_VERSION}/organisations/${orgId}/crafts`, BASE_URL).href;
    logger.debug(`Calling get org crafts endpoint ${endpoint}`);
    return endpoint;
  },
  updateCraft(userId, craftId) {
    const endpoint = new URL(`${API_VERSION}/user/${userId}/crafts/${craftId}`, BASE_URL).href;
    logger.debug(`Calling update craft endpoint ${endpoint}`);
    return endpoint;
  },
  createPerson(userId) {
    const endpoint = new URL(`${API_VERSION}/user/${userId}/people`, BASE_URL).href;
    logger.debug(`Calling create person endpoint ${endpoint}`);
    return endpoint;
  },
  getPersonData(userId, personId) {
    const endpoint = new URL(`${API_VERSION}/user/${userId}/people/${personId}`, BASE_URL).href;
    logger.debug(`Calling get person details endpoint ${endpoint}`);
    return endpoint;
  },
  getPeople(userId) {
    const endpoint = new URL(`${API_VERSION}/user/${userId}/people`, BASE_URL).href;
    logger.debug(`Calling get people endpoint ${endpoint}`);
    return endpoint;
  },
  getOrgPeople(orgId) {
    const endpoint = new URL(`${API_VERSION}/organisations/${orgId}/people`, BASE_URL).href;
    logger.debug(`Calling get org people endpoint ${endpoint}`);
    return endpoint;
  },
  updatePerson(userId, personId) {
    const endpoint = new URL(`${API_VERSION}/user/${userId}/people/${personId}`, BASE_URL).href;
    logger.debug(`Calling update person endpoint ${endpoint}`);
    return endpoint;
  },
  createGar(userId) {
    const endpoint = new URL(`${API_VERSION}/user/${userId}/gar`, BASE_URL).href;
    logger.debug(`Calling create GAR endpoint ${endpoint}`);
    return endpoint;
  },
  updateGar(garId) {
    const endpoint = new URL(`${API_VERSION}/gar/${garId}`, BASE_URL).href;
    logger.debug(`Calling update GAR endpoint ${endpoint}`);
    return endpoint;
  },
  getGar(garId) {
    const endpoint = new URL(`${API_VERSION}/gar/${garId}`, BASE_URL).href;
    logger.debug(`Calling get GAR endpoint ${endpoint}`);
    return endpoint;
  },
  postFile(garId) {
    const endpoint = new URL(`${API_VERSION}/gar/${garId}`, BASE_URL).href;
    logger.debug(`Calling get GAR endpoint ${endpoint}`);
    return endpoint;
  },
  getGarPeople(garId) {
    const endpoint = new URL(`${API_VERSION}/gar/${garId}/people?page=1&per_page=10000`, BASE_URL).href;
    logger.debug(`Calling get GAR people endpoint ${endpoint}`);
    return endpoint;
  },
  getIndividualGars(userId) {
    const endpoint = new URL(`${API_VERSION}/user/${userId}/gars?page=1&per_page=10000`, BASE_URL).href;
    logger.debug(`Calling get individual user GARs endpoint ${endpoint}`);
    return endpoint;
  },
  getOrgGars(userId, orgId) {
    const endpoint = new URL(`${API_VERSION}/user/${userId}/organisation/${orgId}/gars?page=1&per_page=10000`, BASE_URL).href;
    logger.debug(`Calling get org user GARs endpoint ${endpoint}`);
    return endpoint;
  },
  getSupportingDoc(garId) {
    const url = new URL(`${API_VERSION}/gar/${garId}/supportingdocs?page=1&per_page=10000`, BASE_URL).href;
    logger.debug(`Calling get supporting docs endpoint ${url}`);
    return url;
  },
  userSearch(email) {
    const endpoint = new URL(`${API_VERSION}/user/search?email=${email}`, BASE_URL).href;
    logger.debug(`Calling user search endpoint ${endpoint}`);
    return endpoint;
  },
  updateGarPerson(garId) {
    const endpoint = new URL(`${API_VERSION}/gar/${garId}/people`, BASE_URL).href;
    logger.debug(`Calling garperson update endpoint ${endpoint}`);
    return endpoint;
  },
  deleteGarPerson(garId) {
    const endpoint = new URL(`${API_VERSION}/gar/${garId}/people`, BASE_URL).href;
    logger.debug(`Calling garperson delete endpoint ${endpoint}`);
    return endpoint;
  },
  deletePerson(userId, personId) {
    const endpoint = new URL(`${API_VERSION}/user/${userId}/people/${personId}`, BASE_URL).href;
    logger.debug(`Calling delete person details endpoint ${endpoint}`);
    return endpoint;
  },
  deleteCraft(userId, craftId) {
    const endpoint = new URL(`${API_VERSION}/user/${userId}/crafts/${craftId}`, BASE_URL).href;
    logger.debug(`Calling delete craft details endpoint ${endpoint}`);
    return endpoint;
  },
  editOrgUser(orgId) {
    const endpoint = new URL(`${API_VERSION}/organisations/${orgId}/users`, BASE_URL).href;
    logger.debug(`Calling edit org user endpoint ${endpoint}`);
    return endpoint;
  },
  deleteGarSupportingDoc(garId, garSupportingDocId) {
    const endpoint = new URL(`${API_VERSION}/gar/${garId}/supportingdocs/${garSupportingDocId}`, BASE_URL).href;
    logger.debug(`Calling delete supporting document endpoint ${endpoint}`);
    return endpoint;
  },
};

module.exports = endpoints;
