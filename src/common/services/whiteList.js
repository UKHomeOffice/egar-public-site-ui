const logger = require('../utils/logger')(__filename);
const db = require('../utils/db');

module.exports = {
  /**
   * Predicate. True if email is in whitelist table, else false.
   *
   * @param {String} emailAddress Email to check for in whitelist table
   * @returns {Promise} resolves to bool
   */
  isWhitelisted(emailAddress) {
    return new Promise((resolve, reject) => {
      logger.info(`Searching ${emailAddress} against whitelist`);
      db.sequelize.models.WhiteList
        .findOne({
          where: {
            email: db.sequelize.where(db.sequelize.fn('LOWER', db.sequelize.col('email')), '=', emailAddress.toLowerCase())
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
