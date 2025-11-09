const config = require('../config/index');
const logger = require('./logger')(__filename);
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { parseUrlForNonProd } = require('../services/oneLoginApi');

const getOneLoginAuthUrl = (req, res) => {
  try {
    const nonce = uuidv4();
    res.cookie('nonce', nonce, {
      httpOnly: true,
      secure: config.IS_HTTPS_SERVER,
      sameSite: config.SAME_SITE_VALUE,
    });
    const state = uuidv4();
    res.cookie('state', state, {
      httpOnly: true,
      secure: config.IS_HTTPS_SERVER,
      sameSite: config.SAME_SITE_VALUE,
    });
    const oneLoginAuthUrl = `${config.ONE_LOGIN_INTEGRATION_URL}/authorize`;
    const clientId = config.ONE_LOGIN_CLIENT_ID;
    const jwtOptions = {
      aud: oneLoginAuthUrl,
      iss: clientId,
      response_type: 'code',
      client_id: clientId,
      state,
      redirect_uri: parseUrlForNonProd(req, config.ONE_LOGIN_REDIRECT_URI),
      scope: ['openid', 'email'].join(' '),
      nonce,
      vtr: `['Cl.Cm']`,
      ui_locales: 'en',
    };
    const jwt = createJwt(jwtOptions);
    const options = {
      response_type: 'code',
      scope: ['openid', 'email'].join(' '),
      client_id: clientId,
      request: jwt,
    };
    const query = new URLSearchParams(options);
    return `${oneLoginAuthUrl}?${query}`;
  } catch (error) {
    logger.error('Failed to create autherize url');
    throw error;
  }
};

/**
 * Create the log user out request to One Login API.
 * @param id_token param to get the user info from onlogin
 * @returns returns onelogin logout url
 */
const getOneLoginLogoutUrl = (req, id_token, state) => {
  try {
    logger.info('create a logout url for one Login');
    const url = `${config.ONE_LOGIN_INTEGRATION_URL}/logout`;
    const options = {
      id_token_hint: id_token,
      post_logout_redirect_uri: parseUrlForNonProd(req, config.ONE_LOGIN_LOGOUT_URL),
      state,
    };
    const query = new URLSearchParams(options);
    return `${url}?${query}`;
  } catch (error) {
    logger.error('Failed to create oneLogin user logout');
    throw error;
  }
};

const createJwt = (params) => {
  const privateKey = config.ONE_LOGIN_PRIVATE_KEY;
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  return jwt.sign(params, privateKey, { algorithm: 'RS256' });
};

const getOneLoginPublicKey = (header, callback) => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const jwksClient = require('jwks-rsa');
  const client = jwksClient({
    jwksUri: `${config.ONE_LOGIN_INTEGRATION_URL}/.well-known/jwks.json`,
  });

  client.getSigningKey(header.kid, (err, key) => {
    if (!err) {
      const signingKey = key.publicKey || key.rsaPublicKey;
      callback(null, signingKey);
    }
  });
};

const verifyJwt = (idToken, nonce, callback) => {
  let valid = false;
  try {
    const decodedToken = decodeToken(idToken);

    jwt.verify(
      idToken,
      getOneLoginPublicKey,
      {
        audience: config.ONE_LOGIN_CLIENT_ID,
        issuer: `${config.ONE_LOGIN_INTEGRATION_URL}/`,
        nonce,
      },
      (err, decoded) => {
        if (
          !err &&
          decoded !== null &&
          decodedToken.vot === decoded.vot &&
          decodedToken.sub === decoded.sub
        ) {
          valid = true;
        } else {
          logger.error(`Invalid token:${err}`);
          valid = false;
        }
        callback(valid);
      }
    );
  } catch (error) {
    logger.error(`Failed to verify oneLogin token: ${error}`);
    //TODO implement metrics
    // CountLoginError();
    throw error;
  }
};

const decodeToken = (token) => {
  const decodedToken = jwt.decode(token);
  return decodedToken;
};

module.exports = {
  getOneLoginAuthUrl,
  getOneLoginLogoutUrl,
  getOneLoginPublicKey,
  verifyJwt,
  decodeToken,
  createJwt,
};
