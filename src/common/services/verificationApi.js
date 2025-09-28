import request from 'request';
import loggerFactory from '../../common/utils/logger.js';
const logger = loggerFactory(import.meta.url);
import endpoints from '../config/endpoints.js';

const exported = {
  /**
   * Confirms user as verified via API.
   *
   * @param {String} tokenId tokenId sent to user to be verified
   * @param {String} userId userId of user to be verified
   * @returns {Promise} returns response body when resolved
   */
  verifyUser(tokenId) {
    return new Promise((resolve, reject) => {
      logger.info('Sending request to API to verify token');
      request.put({
        headers: { 'content-type': 'application/json' },
        url: endpoints.verifyUser(),
        body: JSON.stringify({
          tokenId,
        }),
      }, (error, _response, body) => {
        if (error) {
          logger.error('Failed to call token verification service');
          reject(new Error('Token verification service failed'));
          return;
        }
        resolve(body);
      });
    }).catch((err) => {
      logger.error(err);
    });
  },

  getUserInviteToken(email) {
    return new Promise((resolve, reject) => {
      const url = new URL(endpoints.verifyUser())
      url.searchParams.append('invitee_email', email)
      logger.info('Sending request to API to verify token');
      request.get({
        url: url.toString(),
        headers: { 'content-type': 'application/json' },
      }, (error, _response, body) => {
        if (error) {
          logger.error('Failed to call token verification service');
          reject(new Error('Token verification service failed'));
          return;
        }
        resolve(JSON.parse(body));
      });
    }).catch((err) => {
      logger.error(err);
    });
  },

  async getUserInviteTokenByTokenId(tokenId) {
    try {
      return await new Promise((resolve, reject) => {
        const url = new URL(endpoints.verifyUser());
        url.searchParams.append('token_id', tokenId);
        logger.info('Sending request to API to verify token');
        request.get({
          url: url.toString(),
          headers: { 'content-type': 'application/json' },
        }, (error, _response, body) => {
          if (error) {
            logger.error('Failed to call token verification service');
            reject(new Error('Token verification service failed'));
            return;
          }
          resolve(JSON.parse(body));
        });
      });
    } catch (err) {
      logger.error(err);
    }
  }
};

export default exported;

export const {
  verifyUser,
  getUserInviteToken,
  getUserInviteTokenByTokenId
} = exported;
