const crypto = require('crypto');
const logger = require('../utils/logger')(__filename);
const config = require('../config/index');

module.exports = {

  /**
   * Generates a hash off an incoming token
   * @returns {String} a string token
   */
  generateHash(token) {
    logger.debug('Generating hash for token');
    // Replace secret string
    const hash = crypto.createHmac('sha256', config.NOTIFY_TOKEN_SECRET)
      .update(token)
      .digest('hex');
    return hash;
  },

  /**
   * Generates a numeric MFA token
   * @returns {String} a MFA token
   */
  genMfaToken() {
    logger.debug('Generating MFA token');
    const tokenLength = config.MFA_TOKEN_LENGTH;
    return Math.floor(Math.pow(10, tokenLength - 1) + Math.random() * 9 * Math.pow(10, tokenLength - 1));
  },
};
