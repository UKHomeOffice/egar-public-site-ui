const logger = require('../utils/logger')(__filename);
const config = require('../config/index');
const { HttpClient } = require('./httpClient');

const createOneLoginClient = () =>
  new HttpClient({
    baseUrl: config.ONE_LOGIN_INTEGRATION_URL,
    redirect: 'error',
  });

const unwrapResponse = (response) => {
  if (response && typeof response === 'object' && !Array.isArray(response) && 'ok' in response) {
    const body = { ...response };
    delete body.ok;
    return body;
  }
  return response;
};

const sendRequest = async (request, errorMessage) => {
  try {
    return unwrapResponse(await request());
  } catch (error) {
    if (error?.type === 'http_error') {
      return error.body;
    }
    logger.error(errorMessage, { errorMessage: error?.message, stack: error?.stack });
    throw error;
  }
};

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
  const internalRegex = '^.*public-site.(dev|sit|staging|test).internal.egar-notprod.homeoffice.gov.uk';
  const notInternalRegex = '^.*public-site.(dev|sit|staging|test).egar-notprod.homeoffice.gov.uk';
  let returnUrl = url;

  if (currentAddress?.match(notInternalRegex) && url.match(internalRegex)) {
    returnUrl = url.replace('.internal.egar-notprod', '.egar-notprod');
  } else if (currentAddress?.match(internalRegex) && url.match(notInternalRegex)) {
    returnUrl = url.replace('.egar-notprod', '.internal.egar-notprod');
  }
  logger.debug('Resolved OneLogin URL', { returnUrl });
  return returnUrl;
};

module.exports = {
  /**
   * Gets a list of users belonging to an organisation.
   * @param {String} orgId id of an organisation to get users for
   * @param {String} organisationName
   * @returns {Promise} resolves with API response.
   */
  async sendOneLoginTokenRequest(req, code, oneLoginUtil) {
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

    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: parseUrlForNonProd(req, config.ONE_LOGIN_REDIRECT_URI),
      client_assertion_type: 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
      client_assertion: jwt,
    });

    const client = createOneLoginClient();
    return sendRequest(
      () =>
        client.post('/token', params.toString(), {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        }),
      'Failed to call OneLogin token API endpoint'
    );
  },

  /**
   * Get the userInfo from One Login API.
   * @param access_token param to get the user info from onlogin
   * @returns returns response body when resolved
   */
  getUserInfoFromOneLogin(access_token) {
    logger.debug('Sending request to fetch OneLogin userinfo');
    const client = createOneLoginClient();
    return sendRequest(
      () =>
        client.get('/userinfo', {
          headers: { Authorization: `Bearer ${access_token}` },
        }),
      'Failed to fetch OneLogin userinfo'
    );
  },

  parseUrlForNonProd,
};
