import notify from 'notifications-node-client';
import loggerFactory from '../utils/logger.js';
const logger = loggerFactory(import.meta.url);
import config from '../config/index.js';

if (config.NOTIFY_API_KEY === null) {
  throw new Error('Mandatory environment variable for GOV.UK Notify not set');
}

// Instantiate a new Notify client
const notifyClient = new notify.NotifyClient(config.NOTIFY_API_KEY);

const exported = {
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
  }
};

export default exported;

export const {
  send
} = exported;
