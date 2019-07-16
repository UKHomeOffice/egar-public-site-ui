const _ = require('lodash');

const logger = require('../utils/logger')(__filename);
const db = require('../utils/db');

module.exports = {
  /**
   * Predicate. True if email is in whitelist table, else false
   * @param {String} email Email to check for in whitelist table
   * @returns {Promise} resolves to bool
   */
  isWhitelisted(email) {
    return new Promise((resolve, reject) => {
      const lowercased = _.toLower(email);
      logger.info(`Searching ${email} against whitelist`);
      db.sequelize.models.WhiteList
        .findOne({
          where: {
            email: lowercased,
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
  },
};
