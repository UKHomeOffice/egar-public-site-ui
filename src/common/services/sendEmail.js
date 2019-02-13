const notify = require('notifications-node-client');
const logger = require('../utils/logger');

const config = require('../config/index');

if (config.NOTIFY_API_KEY === null) {
  throw new Error('Mandatory environment variable for GOV.UK Notify not set');
}

// Instantiate a new Notify client
const notifyClient = new notify.NotifyClient(config.NOTIFY_API_KEY);

module.exports = {
  /**
   *
   * @param {String} template notify template id to use
   * @param {String} email Email address to send to
   * @param {Object} personalisation key value pairs to replace strings in notify template
   */
  send(templateId, email, personalisation) {
    return new Promise((resolve, reject) => {
      notifyClient
        .sendEmail(templateId, email, { personalisation })
        .then(response => resolve(response))
        .catch((err) => {
          logger.error(err);
          reject(err);
        });
    });
  },
};
