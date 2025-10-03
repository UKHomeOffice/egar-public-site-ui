const logger = require('../utils/logger')(__filename);
const config = require('../config/index');
const request = require('request');
const qs = require('querystring');
const { resolve } = require('path');

/**
 * This function is meant to convert URLs in non prod such that if the user is making a request from an internal URL, then a internal URL will be returned.
 * If it is a non-internal URL, then a non-internal URL will be returned.
 *
 * This is designed so that someone testing the service will avoid issues with different URLs for user who are not on the VPN
 *
 * @param url the URL to check
 * @param req node request object
 * @returns
 */
const parseUrlForNonProd = (req, url) => {
  const currentAddress = req.get('host');
  const internalRegex =
    '^.*public-site.(dev|sit|staging|test).internal.egar-notprod.homeoffice.gov.uk';
  const notInternalRegex =
    '^.*public-site.(dev|sit|staging|test).egar-notprod.homeoffice.gov.uk';
  let returnUrl = url;

  if (currentAddress?.match(notInternalRegex) && url.match(internalRegex)) {
    returnUrl = url.replace('.internal.egar-notprod', '.egar-notprod');
    logger.info(`We would change URL: '${url}' to '${returnUrl}'`);
  } else if (
    currentAddress?.match(internalRegex) &&
    url.match(notInternalRegex)
  ) {
    returnUrl = url.replace('.egar-notprod', '.internal.egar-notprod');
    logger.info(`We would change URL: '${url}' to '${returnUrl}'`);
  }
  logger.info(`return URL ${returnUrl}`);
  return returnUrl;
};

module.exports = {
  /**
   * Gets a list of users belonging to an organisation.
   * @param {String} orgId id of an organisation to get users for
   * @param {String} organisationName
   * @returns {Promise} resolves with API response.
   */
  sendOneLoginTokenRequest(req, code, oneLoginUtil) {
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
        grant_type: 'authorization_code',
        code,

        redirect_uri: parseUrlForNonProd(req, config.ONE_LOGIN_REDIRECT_URI),

        client_assertion_type:
          'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',

        client_assertion: jwt,
      };
      request.post(
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          url: `${oneLoginIntegrationUrl}/token`,
          body: qs.stringify(params),
        },
        (error, _response, body) => {
          if (error) {
            logger.error('Failed to call get one login API endpoint');
            reject(JSON.parse(error));
            return;
          }
          logger.debug('Successfully called one login API endpoint');
          resolve(JSON.parse(body));
        }
      );
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
      request.get(
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
          url,
        },
        (error, _response, body) => {
          if (error) {
            logger.error('Failed to fetch userinfo from oneLogin');
            logger.error(`${error}`);
            reject(error);
            return;
          }
          logger.info(`Successfully called oneLogin user info API`);
          resolve(JSON.parse(body));
        }
      );
    });
  },

  parseUrlForNonProd,
};
