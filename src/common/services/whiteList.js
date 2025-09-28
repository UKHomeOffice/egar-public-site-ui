import loggerFactory from '../utils/logger.js';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const logger = loggerFactory(__filename);
import db from '../utils/db.js';

const exported = {
  /**
   * Predicate. True if email is in whitelist table, else false.
   *
   * @param {String} email Email to check for in whitelist table
   * @returns {Promise} resolves to bool
   */
  isWhitelisted(email) {
    return new Promise((resolve, reject) => {
      logger.info(`Searching ${email} against whitelist`);
      db.sequelize.models.WhiteList
        .findOne({
          where: {
            email,
          },
        })
        .then((result) => {
          logger.info(`Whitelist approved: ${result !== null}`);
          return resolve(result !== null);
        })
        .catch((err) => {
          logger.error('Failed to search whitelist');
          logger.error(err);
          return reject(err);
        });
    });
  }
};

export default exported;

export const {
  isWhitelisted
} = exported;
