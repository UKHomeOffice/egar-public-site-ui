const request = require('request');
const moment = require('moment');
const Sequelize = require('sequelize');
const logger = require('../utils/logger')(__filename);
const endpoints = require('../config/endpoints');
const db = require('../utils/db');
const config = require('../config/index');

const { lte } = Sequelize.Op;

module.exports = {
  /**
  * Sends user tokenId to API
  * @param {String} tokenId token id
  * @param {String} userId user id for which token was generated
  * @returns {Promise} returns response body when resolved
  */
  setToken(tokenId, userId) {
    return new Promise((resolve, reject) => {
      request.post({
        headers: { 'content-type': 'application/json' },
        url: endpoints.setToken(),
        body: JSON.stringify({
          tokenId,
          userId,
        }),
      }, (error, response, body) => {
        if (error) {
          logger.error('There was a problem calling the settoken API');
          return console.dir(error);
        }
        logger.debug('Successfully called settoken API');
        resolve(body);
        return body;
      });
    }).catch((err) => {
      logger.error('There was a problem calling the settoken API');
      logger.info(err);
    });
  },

  /**
  * Sends updated user tokenId to API
  * @param {String} tokenId token id
  * @param {String} userId user id for which token was generated
  * @returns {Promise} returns response body when resolved
  */
  updateToken(tokenId, userId) {
    return new Promise((resolve, reject) => {
      request.put({
        headers: { 'content-type': 'application/json' },
        url: endpoints.setToken(),
        body: JSON.stringify({
          tokenId,
          userId,
        }),
      }, (error, response, body) => {
        if (error) {
          logger.error('There was a problem calling the settoken API');
          return console.dir(error);
        }
        logger.info('Successfully called settoken API');
        resolve(body);
        return body;
      });
    }).catch((err) => {
      logger.error('There was a problem calling the settoken API');
      logger.info(err);
    });
  },

  /**
   * Sends organisation invite token to API for storage
   * @param {String} tokenId token id to be stored
   * @param {String} invitorId userid of user sending the invite
   * @param {String} organisationId organisationid of the organisation sending the invite
   * @param {String} roleId roleId of the role the invited user will be given.
   * @returns {Promise} returns response body when resolved.
   */
  setInviteUserToken(tokenId, inviterId, organisationId, roleName) {
    return new Promise((resolve, reject) => {
      request.post({
        headers: { 'content-type': 'application/json' },
        url: endpoints.setToken(),
        body: JSON.stringify({
          tokenId,
          inviterId,
          organisationId,
          roleName,
        }),
      }, (error, response, body) => {
        if (error) {
          logger.error('There was a problem calling the settoken API');
          return console.dir(error);
        }
        logger.info('Successfully called settoken API');
        resolve(body);
        return body;
      });
    }).catch((err) => {
      logger.error('There was a problem calling the settoken API');
      logger.info(err);
    });
  },
  /**
   * Stores the MFA token for a specified user
   * @param {String} Email The email for the user requesting the token
   * @param {Integer} MFAToken The 8 digit MFA token
   * @param {Boolean} Status The status of a token. true if verified else false
   * @returns {Promise} Resolves to sequelize datamodel object.
   */
  setMfaToken(Email, MFAToken, Status) {
    logger.info(`Storing MFA token for ${Email}`);
    return new Promise((resolve, reject) => {
      db.sequelize.models.UserSessions
        .create({
          MFAToken,
          Email,
          Status,
          IssuedTimestamp: new Date(),
        })
        .then((sub) => {
          logger.info('Successfully stored MFA token');
          return resolve(sub);
        })
        .catch((err) => {
          logger.error('Failed to store MFA token');
          logger.error(err);
          return reject(err);
        });
    });
  },
  /**
   * Validates the number of verification attempts for a token
   * @param {Object} UserSession object
   */
  validNumAttempts(token) {
    token.increment('NumAttempts', { by: 1 });
    logger.info(`Token verification attempt number ${token.NumAttempts}`);
    return token.NumAttempts < config.MFA_TOKEN_MAX_ATTEMPTS;
  },
  /**
   * Validates a MFA token for a given user
   * @param {String} Email The email of the user attempting to validate a token
   * @param {Integer} MFAToken The token attempting to be validated
   * @returns {Promise} Resolves to boolean
   */
  validateMfaToken(Email, MFAToken) {
    logger.info(`Attempting to validate token for ${Email}`);
    return new Promise((resolve, reject) => {
      db.sequelize.models.UserSessions
        .findOne({
          where: {
            Email,
          },
          order: [
            ['IssuedTimestamp', 'DESC'],
          ],
        })
        .then((sub) => {
          logger.info('Successfully called validation service');
          if (sub) {
            // Get the existing timestamp
            const issuedTimestamp = moment(sub.get('IssuedTimestamp'));
            // Calculate the expiry
            const expiresTimestamp = issuedTimestamp.clone();
            expiresTimestamp.add(parseInt(config.MFA_TOKEN_EXPIRY, 10), 'minutes');
            // Determine whether the expiry is before current time
            if (!expiresTimestamp.isBefore(moment()) && sub.MFAToken === MFAToken) {
              // Return valid token
              if (this.validNumAttempts(sub)) {
                resolve(true);
              }
              logger.info('Exceeded max token verification attempts');
              reject();
            } else {
              logger.info('Token expired');
              logger.info(`Token verification attempt number ${sub.NumAttempts + 1}`);
              sub.increment('NumAttempts', { by: 1 });
              reject();
            }
          } else {
            logger.info('No matching token found');
            logger.info(`Token verification attempt number ${sub.NumAttempts + 1}`);
            sub.increment('NumAttempts', { by: 1 });
            reject();
          }
        })
        .catch((err) => {
          logger.error(err);
          logger.error('Failed to validate MFA token');
          reject(err);
        });
    });
  },
  /**
   * Updates a give MFA token for an email
   * @param {String} Email Email of the user
   * @param {Integer} MFAToken Token to update
   * @returns {Promise} Resolves with sequelize response
   */
  updateMfaToken(Email, MFAToken) {
    logger.info(`Updating MFA token for ${Email}`);
    return new Promise((resolve, reject) => {
      db.sequelize.models.UserSessions
        .update(
          { StatusChangedTimestamp: new Date(), Status: false },
          {
            where: {
              Email,
              MFAToken,
            },
          },
        )
        .then((sub) => {
          logger.info('Successfully updated MFA token');
          return resolve(sub);
        })
        .catch((err) => {
          logger.error('Failed to update MFA token');
          logger.error(err);
          return reject(err);
        });
    });
  },

  /**
   * Gets last logindate
   * @param {String} Email Email of the user loged in
   * @returns {Promise} Sequelize UserSession instance
   */
  getLastLogin(Email) {
    logger.info(`Get the last login information date for ${Email}`);
    return new Promise((resolve, reject) => {
      db.sequelize.models.UserSessions
        .findOne({
          where: {
            Email,
            Status: ['f'], // Inactive
            NumAttempts: { [lte]: 5 },
          },
          order: [
            ['IssuedTimestamp', 'DESC'],
          ],
          offset: 1,
        })
        .then((resp) => {
          logger.info('Successfully got last logon date');
          resolve(resp);
        }).catch((err) => {
          logger.error('Failed to get last logon date');
          logger.error(err);
          reject(err);
        });
    });
  },
};
