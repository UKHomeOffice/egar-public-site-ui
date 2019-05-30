const crypto = require('crypto');
const moment = require('moment');
const logger = require('../utils/logger')(__filename);


const config = require('../config/index');

module.exports = {
  generateHash(token) {
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
  validate(rawToken) {
    // Hash the raw token
    const hashedToken = this.generateHash(rawToken);
    // call api to validate hashed Token wil return secure token.
  },

};
