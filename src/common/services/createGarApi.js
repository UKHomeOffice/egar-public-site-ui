import request from 'request';
import loggerFactory from '../utils/logger.js';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const logger = loggerFactory(__filename);
import endpoints from '../config/endpoints.js';

const exported = {
  /**
   * Calls create craft API endpoint.
   *
   * @param {String} userId id of user creating the gar
   * @returns {Promise} returns API response when resolved
   */
  createGar(userId) {
    return new Promise((resolve, reject) => {
      request.post({
        headers: { 'content-type': 'application/json' },
        url: endpoints.createGar(userId),
      }, (error, response, body) => {
        if (error) {
          reject(error);
          return error;
        }
        resolve(body);
        return body;
      });
    })
      .catch((err) => {
        logger.error(err);
      });
  }
};

export default exported;

export const {
  createGar
} = exported;
