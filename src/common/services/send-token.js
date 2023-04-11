const notify = require('notifications-node-client');
const logger = require('../utils/logger')(__filename);
const config = require('../config/index');

if (config.NOTIFY_API_KEY === null) {
  throw new Error('Mandatory environment variable for GOV.UK Notify not set');
}

// Instantiate a new Notify client
const notifyClient = new notify.NotifyClient(config.NOTIFY_API_KEY);

module.exports = {

  /**
   * @param {String} user
   * @param {String} token
   * @returns {Boolean}
   */
  // problem, the notify_token_template_id is not available in dev, for a reason.
  // can recreate the template, for interesting purposes. To do.
  send(firstName, email, notifyToken) {
    return new Promise((resolve, reject) => {
      notifyClient
        .sendEmail(config.NOTIFY_TOKEN_TEMPLATE_ID, email, {
          personalisation: {
            first_name: firstName,
            token: notifyToken,
            base_url: config.BASE_URL,
          },
        })
        .then(response => resolve(response))
        .catch((err) => {
          logger.error(err);
          reject(err);
        });
    });
  },
};
