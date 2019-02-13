const notify = require('notifications-node-client');
const logger = require('../utils/logger');
const config = require('../config/index');

if (config.NOTIFY_API_KEY === null) {
  throw new Error('Mandatory environment variable for GOV.UK Notify not set');
}

const notifyClient = new notify.NotifyClient(config.NOTIFY_API_KEY)

module.exports = {
  /**
   * @param {String} user
   * @param {String} token
   * @returns {Boolean}
   */
  send(fname, email, notifyToken) {
    return new Promise((resolve, reject) => {
      notifyClient
        .sendEmail(config.NOTIFY_SUBMISSION_TOKEN_TEMPLATE_ID, email, { personalization: {
          first_name: fname,
          token: notifyToken,
          base_url: config.BASE_URL,
        } })
        .then((response) => resolve(response))
        .catch((err) = {
          logger.error(err);
          reject(err);
        });
    });
  },
};
