const { URL } = require('url');
const settings = require('./index');

const { API_BASE } = settings;
const { API_VERSION } = settings;
const BASE_URL = new URL(API_VERSION, API_BASE).href;

const endpoints = {
  baseUrl() {
    return BASE_URL;
  },
  register() {
    const endpoint = new URL(`${API_VERSION}/user/register`, BASE_URL).href;
    return endpoint;
  },
  getUserData(email) {
    const endpoint = new URL(`${API_VERSION}/user/${email}`, BASE_URL).href;
    return endpoint;
  },
  getUserDataById(userId) {
    const endpoint = new URL(`${API_VERSION}/user/search?user_id=${userId}`, BASE_URL).href;
    return endpoint;
  },
  updateUserData(userId) {
    const endpoint = new URL(`${API_VERSION}/user/${userId}`, BASE_URL).href;
    return endpoint;
  },
  deleteUser(email) {
    const endpoint = new URL(`${API_VERSION}/user/${email}`, BASE_URL).href;
    return endpoint;
  },
  setToken() {
    const endpoint = new URL(`${API_VERSION}/user/settoken`, BASE_URL).href;
    return endpoint;
  },
  verifyUser() {
    const endpoint = new URL(`${API_VERSION}/user/verify`, BASE_URL).href;
    return endpoint;
  },
  registerOrg() {
    const endpoint = new URL(`${API_VERSION}/organisations`, BASE_URL).href;
    return endpoint;
  },
  updateOrg(orgId) {
    const endpoint = new URL(`${API_VERSION}/organisations/${orgId}`, BASE_URL).href;
    return endpoint;
  },
  getOrgDetails(orgId) {
    const endpoint = new URL(`${API_VERSION}/organisations/${orgId}`, BASE_URL).href;
    return endpoint;
  },
  deleteOrgDetails(orgId) {
    const endpoint = new URL(`${API_VERSION}/organisations/${orgId}`, BASE_URL).href;
    return endpoint;
  },
  getOrgUsers(orgId) {
    const endpoint = new URL(`${API_VERSION}/organisations/${orgId}/users`, BASE_URL).href;
    return endpoint;
  },
  getListOfOrgUsers(orgId) {
    const endpoint = new URL(`${API_VERSION}/organisations/${orgId}/users?is_paginated=false`, BASE_URL).href;
    return endpoint;
  },
  getSearchOrgUsers(orgId, searchUser) {
    const endpoint = new URL(`${API_VERSION}/organisations/${orgId}/users/search?searchName=${searchUser}`, BASE_URL)
      .href;
    return endpoint;
  },
  createCraft(userId) {
    const endpoint = new URL(`${API_VERSION}/user/${userId}/crafts`, BASE_URL).href;
    return endpoint;
  },
  getCraftData(userId, craftId) {
    const endpoint = new URL(`${API_VERSION}/user/${userId}/crafts/${craftId}`, BASE_URL).href;
    return endpoint;
  },
  getCrafts(userId) {
    const endpoint = new URL(`${API_VERSION}/user/${userId}/crafts`, BASE_URL).href;
    return endpoint;
  },
  getOrgCrafts(orgId) {
    const endpoint = new URL(`${API_VERSION}/organisations/${orgId}/crafts`, BASE_URL).href;
    return endpoint;
  },
  updateCraft(userId, craftId) {
    const endpoint = new URL(`${API_VERSION}/user/${userId}/crafts/${craftId}`, BASE_URL).href;
    return endpoint;
  },
  createResPerson(userId) {
    const endpoint = new URL(`${API_VERSION}/user/${userId}/responsiblepersons`, BASE_URL).href;
    return endpoint;
  },
  getResPersons(userId) {
    const endpoint = new URL(`${API_VERSION}/user/${userId}/responsiblepersons`, BASE_URL).href;
    return endpoint;
  },
  getResPersonDetail(userId, responsiblepersonId) {
    const endpoint = new URL(`${API_VERSION}/user/${userId}/responsibleperson/${responsiblepersonId}`, BASE_URL).href;
    return endpoint;
  },
  deleteResPerson(userId, responsiblepersonId) {
    const endpoint = new URL(`${API_VERSION}/user/${userId}/responsibleperson/${responsiblepersonId}`, BASE_URL).href;
    return endpoint;
  },
  createPerson(userId) {
    const endpoint = new URL(`${API_VERSION}/user/${userId}/people`, BASE_URL).href;
    return endpoint;
  },
  getPersonData(userId, personId) {
    const endpoint = new URL(`${API_VERSION}/user/${userId}/people/${personId}`, BASE_URL).href;
    return endpoint;
  },
  getPeople(userId) {
    const endpoint = new URL(`${API_VERSION}/user/${userId}/people`, BASE_URL).href;
    return endpoint;
  },
  getOrgPeople(orgId) {
    const endpoint = new URL(`${API_VERSION}/organisations/${orgId}/people`, BASE_URL).href;
    return endpoint;
  },
  updatePerson(userId, personId) {
    const endpoint = new URL(`${API_VERSION}/user/${userId}/people/${personId}`, BASE_URL).href;
    return endpoint;
  },
  createGar(userId) {
    const endpoint = new URL(`${API_VERSION}/user/${userId}/gar`, BASE_URL).href;
    return endpoint;
  },
  updateGar(garId) {
    const endpoint = new URL(`${API_VERSION}/gar/${garId}`, BASE_URL).href;
    return endpoint;
  },
  getGar(garId, isCbpId = false) {
    const endpoint = new URL(`${API_VERSION}/gar/${garId}?cbp_id=${String(isCbpId)}`, BASE_URL).href;
    return endpoint;
  },
  submitGARForCheckin(garId) {
    const endpoint = new URL(`${API_VERSION}/gar/${garId}/checkin`, BASE_URL).href;
    return endpoint;
  },
  submitGARForException(garId, onlyIndividuals) {
    const endpoint = new URL(
      `${API_VERSION}/gar/${garId}/departure/exception?only_individuals=${onlyIndividuals}`,
      BASE_URL
    ).href;
    return endpoint;
  },
  postFile(garId) {
    const endpoint = new URL(`${API_VERSION}/gar/${garId}`, BASE_URL).href;
    return endpoint;
  },
  getGarPeople(garId, amg_response_code_priority, page) {
    const priority = new URLSearchParams(amg_response_code_priority).toString();
    const endpoint = new URL(`${API_VERSION}/gar/${garId}/people?page=${page}&per_page=10000&${priority}`, BASE_URL)
      .href;
    return endpoint;
  },
  getIndividualGars(userId, pages) {
    const { page, status, perPage } = pages;
    const endpoint = new URL(
      `${API_VERSION}/user/${userId}/gars?status=${status}&page=${page}&per_page=${perPage}`,
      BASE_URL
    ).href;
    return endpoint;
  },
  getOrgGars(userId, orgId, pages) {
    const { page, status, perPage } = pages;

    const endpoint = new URL(
      `${API_VERSION}/user/${userId}/organisation/${orgId}/gars?status=${status}&page=${page}&per_page=${perPage}`,
      BASE_URL
    ).href;
    return endpoint;
  },
  getSupportingDoc(garId) {
    const url = new URL(`${API_VERSION}/gar/${garId}/supportingdocs?page=1&per_page=10000`, BASE_URL).href;
    return url;
  },
  userSearch(email, oneLoginSid = null) {
    let params = { email };

    if (oneLoginSid) {
      params['one_login_sid'] = oneLoginSid;
    }

    const endpoint = new URL(`${API_VERSION}/user/search`, BASE_URL);
    endpoint.search = new URLSearchParams(params).toString();
    return endpoint.href;
  },
  createUser() {
    const endpoint = new URL(`${API_VERSION}/user/register`, BASE_URL).href;
    return endpoint;
  },
  updateGarPerson(garId) {
    const endpoint = new URL(`${API_VERSION}/gar/${garId}/people`, BASE_URL).href;
    return endpoint;
  },
  deleteGarPeople(garId) {
    const endpoint = new URL(`${API_VERSION}/gar/${garId}/people`, BASE_URL).href;
    return endpoint;
  },
  deletePerson(userId, personId) {
    const endpoint = new URL(`${API_VERSION}/user/${userId}/people/${personId}`, BASE_URL).href;
    return endpoint;
  },
  deleteCraft(userId, craftId) {
    const endpoint = new URL(`${API_VERSION}/user/${userId}/crafts/${craftId}`, BASE_URL).href;
    return endpoint;
  },
  editOrgUser(orgId) {
    const endpoint = new URL(`${API_VERSION}/organisations/${orgId}/users`, BASE_URL).href;
    return endpoint;
  },
  deleteOrgUser(orgId) {
    const endpoint = new URL(`${API_VERSION}/organisations/${orgId}/users`, BASE_URL).href;
    return endpoint;
  },
  deleteGarSupportingDoc(garId, garSupportingDocId) {
    const endpoint = new URL(`${API_VERSION}/gar/${garId}/supportingdocs/${garSupportingDocId}`, BASE_URL).href;
    return endpoint;
  },

  getGarCheckinProgress(garId) {
    const endpoint = new URL(`${API_VERSION}/gar/${garId}/progress`, BASE_URL).href;
    return endpoint;
  },
  getIndividualGarsCount(userId) {
    const endpoint = new URL(`${API_VERSION}/user/${userId}/gars/count`, BASE_URL).href;
    return endpoint;
  },
  getOrgGarsCount(userId, orgId) {
    const endpoint = new URL(`${API_VERSION}/user/${userId}/organisation/${orgId}/gars/count`, BASE_URL).href;
    return endpoint;
  },
};

module.exports = endpoints;
