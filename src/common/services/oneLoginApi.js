const logger = require('../utils/logger')(__filename);
const endpoints = require('../config/endpoints');
const db = require('../utils/db');
const config = require('../config/index');
const oneLoginUtil = require('../utils/oneLoginAuth');
const request = require('request');
const qs = require('querystring');
const {resolve} = require('path');

module.exports = {
  /**
   * Gets a list of users belonging to an organisation.
   * @param {String} orgId id of an organisation to get users for
   * @param {String} organisationName
   * @returns {Promise} resolves with API response.
   */
  sendOneLoginTokenRequest(code) {
    return new Promise((resolve, reject) => {
      const oneLoginIntegrationUrl = config.ONE_LOGIN_INTEGRATION_URL;
      const clientId = config.ONE_LOGIN_CLIENT_ID;
      const jwtParams = {
        aud: `${oneLoginIntegrationUrl}/token`,
        iss: clientId,
        sub: clientId,
        exp: Math.floor(Date.now() / 1000) + 300,
        jti: `${Math.floor(Math.random() * 999999999999999)}`,
        iat: Math.floor(Date.now() / 1000),
      };

      const jwt = oneLoginUtil.createJwt(jwtParams);

      const params = {
        // eslint-disable-next-line camelcase
        grant_type: 'authorization_code',
        code,
        // eslint-disable-next-line camelcase
        redirect_uri: config.ONE_LOGIN_REDIRECT_URI,
        // eslint-disable-next-line camelcase
        client_assertion_type:
          'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
        // eslint-disable-next-line camelcase
        client_assertion: jwt,
      };
      request.post({
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        url: `${oneLoginIntegrationUrl}/token`,
        body: qs.stringify(params),
      }, (error, _response, body) => {
        if (error) {
          logger.error('Failed to call get one login API endpoint');
          reject(JSON.parse(error));
          return;
        }
        logger.debug('Successfully called one login API endpoint');
        resolve(JSON.parse(body));
      });
    });
  },

  /**
   * Get the userInfo from One Login API.
   * @param access_token param to get the user info from onlogin
   * @returns returns response body when resolved
   */
  getUserInfoFromOneLogin(access_token) {
    return new Promise((resolve, reject) => {
      logger.info('Sending request to fetch userinfo from one Login');
      const url = `${config.ONE_LOGIN_INTEGRATION_URL}/userinfo`;
      request.get({
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
        url
      }, (error, _response, body) => {
        if (error) {
          logger.error('Failed to fetch userinfo from oneLogin');
          logger.error(`${error}`);
          reject(error);
          return;
        }
        logger.info(`Successfully called oneLogin user info API`);
        resolve(JSON.parse(body));
      });
    });
  },
}
