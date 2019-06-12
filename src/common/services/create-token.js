const crypto = require('crypto');
const logger = require('../utils/logger')(__filename);
const config = require('../config/index');

module.exports = {

  generateHash(token) {
    // Replace secret string
    const hash = crypto.createHmac('sha256', config.NOTIFY_TOKEN_SECRET)
      .update(token)
      .digest('hex');
    return hash;
  },

  /**
   * @param {String} user
   * @param {String} token
   * @returns {Boolean}
   */
  create(rawToken, email, firstName, lastName, ipAddress) {
    // Hash the raw token
    let hashedToken = this.generateHash(rawToken);
    return new Promise((resolve, reject) => {
      // call to api to store token in Dbs
    })
      .then((hashedToken) => {
        resolve(hashedToken);
      })
      .catch((err) => {
        logger.error(err);
        reject(err);
      });
  },

  /**
   * Generates a numeric MFA token
   * @returns {String} a MFA token
   */
  genMfaToken() {
    const tokenLength = config.MFA_TOKEN_LENGTH;
    return Math.floor(Math.pow(10, tokenLength - 1) + Math.random() * 9 * Math.pow(10, tokenLength - 1));
  },
};
